import { FreeCamera, Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { WebXRCamera, WebXRDefaultExperience, WebXRSessionManager } from "@babylonjs/core/XR";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math";

export class PlayerController {
    public xrSessionManager: WebXRSessionManager;
    public xrHelper: WebXRDefaultExperience;
    public xrCamera: WebXRCamera;
    public collider: Mesh;
    public enableLocomotion: boolean = false;

    private _scene: Scene;

    // locomotion stuff
    private static readonly SPEEDCAP: number = 3.5;
    public velocity: number = 0;   // for data collection

    constructor(scene: Scene, canvas: HTMLCanvasElement) {
        this._scene = scene;

        // this creates and positions a first-person non-VR camera (non-mesh)
        const camera: FreeCamera = new FreeCamera("Default Camera", new Vector3(0, 1.6, 0.75), scene);
        
        // set non-VR camera view to VR camera's view
        camera.fov = 90 * Math.PI / 180;

        // this attaches the camera to the canvas
        camera.attachControl(canvas, true);
    }

    public async loadXR() : Promise<void> {
        // create XR experience && xr camera/player
        this.xrHelper = await this._scene.createDefaultXRExperienceAsync({ disableTeleportation: true });

        this.xrSessionManager = this.xrHelper.baseExperience.sessionManager;

        this.xrCamera = this.xrHelper.input.xrCamera;
        this.xrCamera.name = "XR Camera";
        this.xrCamera.position.set(0, 1.6, 1);

        this.collider = this._createXRCollider();
        this.collider.setParent(this.xrCamera);

        // // setting these to true doesn't DO anything...?
        // this.xrCamera.applyGravity = true;
        // this.xrCamera.checkCollisions = true;
    }

    private _createXRCollider() : Mesh {
        // create ellipsoid for VR player collisions
        const collider: Mesh = MeshBuilder.CreateSphere("Player collider", { diameterX: 0.5, diameterY: 1.6, diameterZ: 0.5 });
        collider.visibility = 0;
        collider.checkCollisions = true;
        collider.position = this.xrCamera.position;

        return collider;
    }

    public updateMovement(value: number, deltaTime: number) : void {
        if (this.enableLocomotion) {
            // negative b/c thumbstick values inverted for no good reason...?
            this.velocity = -(PlayerController.SPEEDCAP * value);

            let speed = deltaTime / 1000 * this.velocity;

            if (speed) {
                // get player/camera's forward vector
                let forward: Vector3 = this.xrCamera.getDirection(Vector3.Forward());
        
                // multiply player's forward vector by direction and speed
                forward.scaleInPlace(speed);

                // why does the x value need to be negative? i don't know, but it works...
                let direction: XRRigidTransform = new XRRigidTransform({
                    x: -forward.x,  // why? idk? it works? will find out when I have the luxury of time?
                    y: 0,           // so user can't go flying up in the air
                    z: forward.z
                });

                let newPosition: XRReferenceSpace = this.xrSessionManager.referenceSpace.getOffsetReferenceSpace(direction);

                this.xrSessionManager.referenceSpace = newPosition;

                //// this works too but ^^ is more consistent with Babylon documentation
                //this.xrCamera.position.addInPlace(directionVector.scale(forward));

                // babylon is stupid and will move the collider away from camera unless you do this.
                this.collider.setPositionWithLocalVector(Vector3.Zero());
            }
        }
        else {
            this.velocity = 0;
        }
    }

    public setPosition(globalPosition: Vector3) {
        globalPosition.y = this.xrCamera.globalPosition.y;

        // ummmm, positioning cam via reference space doesn't work?
        // idk why?
        // will figure it out when i have time...?
        this.xrCamera.position = globalPosition;
    }

    public setOrientation(absoluteAngle: number) {
        // get user's y-rotation
        let camAngle: number = this.xrCamera.absoluteRotation.toEulerAngles().y;

        // get difference between current and desired y-rotation
        let angle: number = absoluteAngle - camAngle;

        // reorient user
        this.xrCamera.rotationQuaternion.multiplyInPlace(Quaternion.FromEulerAngles(0, angle, 0));
    }
}