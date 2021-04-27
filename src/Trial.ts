import { AbstractMesh, Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { StandardMaterial, Texture } from "@babylonjs/core/Materials";
import { WebXRCamera } from "@babylonjs/core/XR";
import { Color3, Quaternion, Vector3 } from "@babylonjs/core/Maths";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { Observable, Scene, SceneLoader } from "@babylonjs/core";

// side effects
import "@babylonjs/loaders/glTF/2.0/glTFLoader";

export class Trial extends Observable<{ timestamp: number }> {
    private _wallMaterial: StandardMaterial;
    private _coinMaterial: StandardMaterial;
    private _scene: Scene;

    private _trialAssets: TransformNode; // maze & coins

    private _trialNumber: number = 0;

    private _lastPosition: Vector3;
    private _lastAngle: number;
    private _totalCoinsInMaze: number;
    private _startTime: number;
    private _endTime: number;

    constructor(scene: Scene) {
        super();

        this._scene = scene;
        this._loadTextures();
        
        this._trialAssets = new TransformNode("Tutorial assets");
        // this._loadMaze("TutorialMaze");
    }

    public _loadTextures() : void {
        let coinTexture: Texture = new Texture("assets/textures/gold2.png", this._scene);
        this._coinMaterial = new StandardMaterial("coin", this._scene);
        this._coinMaterial.bumpTexture = new Texture("assets/textures/gold2n.png", this._scene);
        this._coinMaterial.specularPower = 100;
        this._coinMaterial.diffuseTexture = coinTexture;

        let wallTexture: Texture = new Texture("assets/textures/tile.png", this._scene);
        wallTexture.uScale = 11;
        wallTexture.vScale = 10;
        this._wallMaterial = new StandardMaterial("wall material", this._scene);
        this._wallMaterial.specularTexture = new Texture("assets/textures/tilen.png", this._scene);
        this._wallMaterial.bumpTexture = new Texture("assets/textures/tile.png", this._scene);
        this._wallMaterial.bumpTexture.level = 0.3;
        this._wallMaterial.diffuseTexture = wallTexture;
    }

    public newTrial(player: WebXRCamera, collider: Mesh) : void {
        // delete any coins & maze remaining from last trial
        this._trialAssets.dispose();
        this._trialAssets = new TransformNode("Trial assets");
        // prob don't need to do this but be paranoid and do it anyway
        // this._scene.getTransformNodeByID("Coins").dispose();

        this.loadMaze("Maze" + ++this._trialNumber);
        this.loadCoins(player, collider, "Trial" + this._trialNumber);

        this._startTime = Date.now(); 
    }

    public async loadMaze(maze: String) : Promise<void> {
        let mazeMeshes: AbstractMesh[];
        await SceneLoader.ImportMeshAsync("", "assets/models/", maze + ".glb", this._scene)
            .then((result) => {
                result.meshes[0].name = "Maze";
                result.meshes[0].setParent(this._trialAssets);
                result.meshes[0].rotation.y += Math.PI / 2;

                mazeMeshes = result.meshes[0].getChildMeshes();

                mazeMeshes.forEach(element => {
                    if (element.getClassName() == "Mesh") {
                        element.checkCollisions = true;
                        element.material = this._wallMaterial;
                    }
                });
            })
            .then(() => { return; });
    }

    // this also relocates and reorients user to starting position
    // each func should only do 1 thing but i'm writing spaghetti code so
    // KEEP YOUR JUDGEMENTS TO YOURSELF
    private async loadCoins(player: WebXRCamera, collider: Mesh, coinMesh: String) : Promise<void> {
        // import the mesh of coins
        let coinMeshes: AbstractMesh[];
        SceneLoader.ImportMesh("", "assets/models/", coinMesh + ".glb", this._scene, (meshes) => {
            meshes[0].name = "Coins";

            // get actual coins
            coinMeshes = meshes[0].getChildMeshes();
            this._totalCoinsInMaze = coinMeshes.length - 1; // b/c first coin is not collectable

            // save pointer to first coin for disposal at end of trial
            coinMeshes[0].setParent(this._trialAssets);

            // apply coin texture to first coin (other coins will be instanced meshes of this one)
            coinMeshes[0].material = this._coinMaterial;

            // do not include first coin - first coin is just placemarker for starting position
            for (let index: number = 1; index < coinMeshes.length; index++) {
                // enable collisions so user can collect coins
                coinMeshes[index].checkCollisions = true;

                // make coins disappear when collected
                coinMeshes[index].actionManager = new ActionManager(this._scene);
                coinMeshes[index].actionManager.registerAction(
                    new ExecuteCodeAction({
                            trigger: ActionManager.OnIntersectionEnterTrigger,
                            parameter: { mesh: collider }
                        },
                        () => {
                            if (coinMeshes[index].getClassName() == "InstancedMesh") {
                                // store these in case user gets lost so we can plop them back in the right place
                                this._lastPosition = coinMeshes[index].absolutePosition;
                                console.log("from coin: " + this._lastPosition);
                                this._lastAngle = coinMeshes[index].absoluteRotationQuaternion.toEulerAngles().y + Math.PI / 2;

                                this.notifyObservers({ timestamp: Date.now() }, 1); // tell data collection manager to log coin pickup
                                coinMeshes[index].dispose();  // don't dispose of source coin or they'll all disappear
                            }

                            // upon collecting last coin, let app know trial is over
                            if (index == coinMeshes.length - 1) {
                                this._endTime = Date.now(); // store end time for data collection manager to access after user submits discomfort score
                                this.notifyObservers({ timestamp: this._endTime }, 2);  // tell App to ask for discomfort score
                            }
                        })
                );
            }

            // hide first coin b/c that's where user starts
            coinMeshes[0].isVisible = false;
            // set coin height b/c babylon is weird and user will be stuck at coin's height...? 
            // even though we will be setting player position to this._lastPosition instead of actual coin's position?
            // this is really really really dumb??????
            // find better sol later?
            coinMeshes[0].position.y = 1.6; // 0.6

            // get first coin's position & rotation
            this._lastPosition = coinMeshes[0].getAbsolutePosition();
            this._lastAngle = coinMeshes[0].absoluteRotationQuaternion.toEulerAngles().y;

            // put player in starting position & rotation
            player.position = this._lastPosition;

            // get user's y-rotation
            let camAngle: number = player.absoluteRotation.toEulerAngles().y;

            // get difference between current and desired y-rotation
            let angle: number = this._lastAngle - camAngle;

            // rotate user to correct rotation (why 90 degress? honestly, idk. it just works)
            player.rotationQuaternion.multiplyInPlace(Quaternion.FromEulerAngles(0, angle + Math.PI / 2, 0));
        });
    }

    public loadTutorial(player: WebXRCamera, collider: Mesh) : void {
      this.loadCoins(player, collider, "TutorialCoins");
    }

    public get trialNumber() {
        return this._trialNumber;
    }

    public get lastPosition() {
      return this._lastPosition;
    }

    public get lastAngle() {
        return this._lastAngle;
    }

    public get startTime() {
        return this._startTime;
    }

    public get endTime() {
        return this._endTime;
    }

    public get totalCoinsInMaze() {
        return this._totalCoinsInMaze;
    }
}
