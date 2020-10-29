import { FreeCamera, Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { WebXRCamera, WebXRDefaultExperience, WebXRSessionManager } from "@babylonjs/core/XR";
import { Vector3 } from "@babylonjs/core/Maths/math";

export class PlayerController
{
    public xrHelper: WebXRDefaultExperience;
    public xrCamera: WebXRCamera;
    public collider: Mesh;

    private _scene: Scene;

    // locomotion stuff
    private static readonly SPEED: number = 0.05;

    constructor(scene: Scene, canvas: HTMLCanvasElement)
    {
        this._scene = scene;

        // this creates and positions a first-person non-VR camera (non-mesh)
        const camera: FreeCamera = new FreeCamera("Default Camera", new Vector3(0, 1.6, 0.75), scene);
        
        // set non-VR camera view to VR camera's view
        camera.fov = 90 * Math.PI / 180;

        // apply gravity to camera
        camera.applyGravity = true;

        // this attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // set ellipsoid around camera to represent user
        camera.ellipsoid = new Vector3(1, 2, 1);

        // enable collisions on user
        camera.checkCollisions = true;
    }

    public async loadXR() : Promise<void>
    {
        // create XR experience && xr camera/player
        this.xrHelper = await this._scene.createDefaultXRExperienceAsync({ disableTeleportation: true });

        this.xrCamera = this.xrHelper.input.xrCamera;
        this.xrCamera.name = "XR Camera";
        this.xrCamera.position.set(0, 1.6, 1);


        this.collider = this._createXRCollider();
        this.collider.position.set(0, 1.6, 1);
        this.collider.setParent(this.xrCamera);


        // setting these to true doesn't DO anything...?
        this.xrCamera.applyGravity = true;
        this.xrCamera.checkCollisions = true;
    }

    private _createXRCollider() : Mesh
    {
        // create ellipsoid for VR player collisions
        const collider: Mesh = MeshBuilder.CreateSphere("Player collider", { diameterX: 0.5, diameterY: 1, diameterZ: 0.5 });
        // collider.visibility = 0;
        collider.checkCollisions = true;
        collider.position = this.xrCamera.position;

        return collider;
    }

    public updateMovement(value: number) : void
    {
        // // +1 = forwards, -1 = backwards
        // let input: number = -(value/Math.abs(value));

        // // get player/camera's forward vector
        // let forward: Vector3 = this.xrCamera.getDirection(Vector3.Forward());
    
        // // multiply player's forward vector by direction and speed
        // forward.scaleInPlace(input * PlayerController.SPEED);
        // forward.y = 0;    // so user can't go flying up in the air


        // // this.playerContainer.position = forward;

        // this.collider.moveWithCollisions(forward);

        let sessionManager: WebXRSessionManager = this.xrHelper.baseExperience.sessionManager;

        // +1 = forwards, -1 = backwards
        let input: number = -(value/Math.abs(value));

        // get player/camera's forward vector
        let forward: Vector3 = this.xrCamera.getDirection(Vector3.Forward());
    
        // multiply player's forward vector by direction and speed
        forward.scaleInPlace(input * PlayerController.SPEED);

        // why does the x value need to be negative? i don't know, but it works...
        let direction: XRRigidTransform = new XRRigidTransform({
            x: -forward.x,
            y: 0,   // so user can't go flying up in the air
            z: forward.z,
        });

        let newPosition: XRReferenceSpace = sessionManager.referenceSpace.getOffsetReferenceSpace(direction);

        sessionManager.referenceSpace = newPosition;
    }
}