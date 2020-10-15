import { FreeCamera, Mesh, MeshBuilder, Scene, WebXRCamera, WebXRDefaultExperience } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";

// custom classes
import { InputManager } from "./inputManager";

export class PlayerController
{
    public xrHelper: WebXRDefaultExperience;
    public xrCamera: WebXRCamera;
    public playerCollider: Mesh;

    private _scene: Scene;

    // locomotion stuff
    private _moveDirection: Vector3 = Vector3.Zero();
    private _inputManager: InputManager;


    constructor(scene: Scene, canvas: HTMLCanvasElement)
    {
        this._scene = scene;

        // this creates and positions a first-person non-VR camera (non-mesh)
        const camera = new FreeCamera("Default Camera", new Vector3(0, 4, -2), scene);
        
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

        this.playerCollider = this.createXRCollider();

        // setting these to true doesn't DO anything...?
        // xrCamera.applyGravity = true;
        // xrCamera.checkCollisions = true;
    }

    private createXRCollider() : Mesh
    {
        // create ellipsoid for VR player collisions
        const collider = MeshBuilder.CreateSphere("Player", { diameterX: 0.5, diameterY: 1, diameterZ: 0.5 });
        collider.visibility = 0;
        collider.checkCollisions = true;
        collider.position = this.xrCamera.position;

        return collider;
    }

    public setInputManager(inputManager: InputManager)
    {
        this._inputManager = inputManager;
    }

    public updateMovement() : void
    {

        if (this._inputManager?.z)
        {
            // this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;

            // get player/camera's forward vector
            let forward: Vector3 = this.xrCamera.getDirection(Vector3.Forward());

            // multiply by thumbstick's up/down value
            let direction: Vector3 = forward.scaleInPlace(-this._inputManager.z * 0.3);

            // add resulting vector to camera's current position vector
            this._moveDirection =  this.xrCamera.position.addInPlace(direction);
            this._moveDirection.y = this.xrCamera.position.y;      // so user can't go flying up in the air

            // set camera's new position
            this.xrCamera.position = this._moveDirection;

            // this is a hacky workaround for the collider because the WebXRCamera collider doesn't DO anything
            this.playerCollider.position = this.xrCamera.position;
        }
    }
}