import { AbstractMesh, Mesh } from "@babylonjs/core/Meshes";
import { StandardMaterial, Texture } from "@babylonjs/core/Materials";
import { WebXRCamera } from "@babylonjs/core/XR";
import { Color3, Quaternion, Vector3 } from "@babylonjs/core/Maths";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { Observable, Scene, SceneLoader } from "@babylonjs/core";

// side effects
import "@babylonjs/loaders/glTF/2.0/glTFLoader";

export class Trial extends Observable<{ timestamp: number }> {
    private _lastPosition: Vector3;
    private _lastAngle: number;
    private _totalCoinsInMaze: number;
    private _startTime: number;
    private _endTime: number;

    constructor(player: WebXRCamera, collider: Mesh, trialNumber: number, scene: Scene) {
        super();
        
        // load texture
        let coinTexture: Texture = new Texture("assets/textures/gold.png", scene );
        let coinMaterial: StandardMaterial = new StandardMaterial("coin", scene);
        coinMaterial.diffuseTexture = coinTexture;

        // import the mesh of coins
        let coinMeshes: AbstractMesh[];
        SceneLoader.ImportMesh("", "assets/models/", "Trial" + trialNumber.toString() + ".glb", scene, (meshes) => {
            meshes[0].name = "Coins";
            meshes[0].scaling = new Vector3(1, 0.5, 1);
            meshes[0].rotation = new Vector3(0, Math.PI / 2, 0);
            
            // lower coins so short people don't get whacked in the face collecting them
            meshes[0].position.y = -0.5;

            // get actual coins
            coinMeshes = meshes[0].getChildMeshes();
            this._totalCoinsInMaze = coinMeshes.length - 1; // b/c first coin is not collectable

            // apply coin texture to first coin (other coins will be instanced meshes of this one)
            coinMeshes[0].material = coinMaterial;

            // do not include first coin - first coin is just placemarker for starting position
            for (let index: number = 1; index < coinMeshes.length; index++) {
                // scale coins here b/c too lazy to change them in Unity
                coinMeshes[index].scaling = new Vector3(0.3, 0.02, 0.3);

                // enable collisions so user can collect coins
                coinMeshes[index].checkCollisions = true;

                // make coins disappear when collected
                coinMeshes[index].actionManager = new ActionManager(scene);
                coinMeshes[index].actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnIntersectionEnterTrigger,
                            parameter: { mesh: collider }
                        },
                        () => {
                            // store these in case user gets lost so we can plop them back in the right place
                            this._lastPosition = coinMeshes[index].absolutePosition;
                            this._lastAngle = coinMeshes[index].absoluteRotationQuaternion.toEulerAngles().y + Math.PI;

                            if (coinMeshes[index].getClassName() == "InstancedMesh") {
                                this.notifyObservers({ timestamp: Date.now() }, 1); // tell data collection manager to log coin pickup
                                coinMeshes[index].dispose();  // don't dispose of source coin or they'll all disappear
                            }

                            // upon collecting last coin, let app know trial is over
                            if (index == coinMeshes.length - 1) {
                                this._endTime = Date.now(); // store end time for data collection manager to access after user submits discomfort score
                                this.notifyObservers({ timestamp: this._endTime }, 2);  // tell App to ask for discomfort score
                            }
                        }
                    )
                );
            }

            // hide first coin b/c that's where user starts
            coinMeshes[0].isVisible = false;
            // set coin height b/c babylon is weird and user will be stuck at coin's height...? 
            // even though we will be setting player position to this._lastPosition instead of actual coin's position?
            // this is really really really dumb??????
            // find better sol later?
            coinMeshes[0].position.y = 2.15;

            // get first coin's position & rotation
            this._lastPosition = coinMeshes[0].absolutePosition;
            this._lastAngle = coinMeshes[0].absoluteRotationQuaternion.toEulerAngles().y + Math.PI;

            // put player in starting position & rotation
            player.position = this._lastPosition;

            // get user's y-rotation
            let camAngle: number = player.absoluteRotation.toEulerAngles().y;

            // get difference between current and desired y-rotation
            let angle: number = this._lastAngle - camAngle;

            // rotate user to correct rotation (why -90 degress? honestly, idk. it just works)
            player.rotationQuaternion.multiplyInPlace(Quaternion.FromEulerAngles(0, angle - Math.PI / 2, 0));
        });

        this._startTime = Date.now(); 
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
