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
                                console.log("hello from last coin");
                                this.notifyObservers({ coinsCollected: this._coinsCollected, duration: this._startTime });
                            }
                        }
                    )
                );
            }

            // get first coin's position & rotation
            this._lastPosition = coinMeshes[0].absolutePosition;
            this._lastPosition.y = 30;
            this._lastOrientation = Quaternion.FromEulerAngles(0, (coinMeshes[0].rotation.y - 90) * Math.PI / 180, 0);

            // hide first coin b/c that's where user starts
            coinMeshes[0].isVisible = false;

            console.log("initial position & orientation: " + player.position + ", " + player.rotationQuaternion);

            // put player in starting position & rotation
            player.position = this._lastPosition;
            player.rotationQuaternion.multiplyInPlace(this._lastOrientation);


            console.log("initial trial position & orientation: " + player.position + ", " + player.rotationQuaternion);
            console.log("absolute rotation " + player.absoluteRotation);

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