import { AbstractMesh, Mesh } from "@babylonjs/core/Meshes";
import { WebXRCamera } from "@babylonjs/core/XR";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { Scene, SceneLoader } from "@babylonjs/core";

// custom classes
import { Observable } from "@babylonjs/core/Misc/observable";

export class Trial extends Observable<{coinsCollected: number, duration: number}> {
    private _lastPosition: Vector3;
    private _lastOrientation: Quaternion;
    private _coinsCollected: number;
    private _startTime: number;

    constructor(player: WebXRCamera, collider: Mesh, trialNumber: number, scene: Scene) {
        super();

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
                            this._lastPosition = coinMeshes[index].absolutePosition;
                            this._lastOrientation = Quaternion.FromEulerAngles(0, (coinMeshes[index].rotation.y - 90) * Math.PI / 180, 0);
                            this._coinsCollected++;

                            if (coinMeshes[index].getClassName() == "InstancedMesh") {
                                coinMeshes[index].dispose();  // don't dispose of source coin or they'll all disappear
                            }

                            if (index == coinMeshes.length - 1) {
                                this.notifyObservers({ coinsCollected: this._coinsCollected, duration: this._startTime });
                            }
                        }
                    )
                );
            }

            // get first coin's position & rotation
            this._lastPosition = coinMeshes[0].absolutePosition;
            this._lastOrientation = Quaternion.FromEulerAngles(0, (coinMeshes[0].rotation.y - 90) * Math.PI / 180, 0);

            // hide first coin b/c that's where user starts
            coinMeshes[0].isVisible = false;
            // set coin height b/c babylon is weird and user will be stuck at coin's height...? 
            // even though we will be setting player position to this._lastPosition instead of actual coin's position?
            // this is really really really dumb??????
            // find better sol later?
            coinMeshes[0].position.y = 2;

            console.log("this should be the same as the next line below except for the y value: " + this._lastPosition);
            console.log(coinMeshes[0].absolutePosition);
            console.log(coinMeshes[0].position);

            console.log("initial position before trial: " + player.position);
            console.log("initial absolute pos before trial: " + player.globalPosition);
            console.log("initial quat before trial: " + player.rotationQuaternion);
            console.log("initial abso rotation before trial: " + player.absoluteRotation);

            // put player in starting position & rotation
            player.position = this._lastPosition;
            player.rotationQuaternion.multiplyInPlace(this._lastOrientation);


            console.log("new position: " + player.position);
            console.log("new absolute pos: " + player.globalPosition);
            console.log("new quat: " + player.rotationQuaternion);
            console.log("new abso: " + player.absoluteRotation);

            this._coinsCollected = 0;
        });

        // start time
    }

    public get lastPosition() {
        return this._lastPosition;
    }

    public get lastOrientation() {
        return this._lastOrientation;
    }
}