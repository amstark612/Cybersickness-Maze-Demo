import { FreeCamera, Mesh, MeshBuilder, Scene, WebXRCamera, WebXRDefaultExperience } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";

// custom classes
import { InputManager } from "./inputManager";

export class PlayerController
{
    public xrHelper: WebXRDefaultExperience;
    public xrCamera: WebXRCamera;
    public collider: Mesh;

    private _scene: Scene;

    // locomotion stuff
    private static readonly SPEED: number = 0.05;
    private _moveDirection: Vector3 = Vector3.Zero();
    private _inputManager: InputManager;

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

        this.collider = this._createXRCollider();

        // setting these to true doesn't DO anything...?
        this.xrCamera.applyGravity = true;
        this.xrCamera.checkCollisions = true;
    }

    private _createXRCollider() : Mesh
    {
        // create ellipsoid for VR player collisions
        const collider: Mesh = MeshBuilder.CreateSphere("Player", { diameterX: 0.5, diameterY: 1, diameterZ: 0.5 });
        collider.visibility = 0;
        collider.checkCollisions = true;
        collider.position = this.xrCamera.position;

        return collider;
    }

    public updateMovement() : void
    {
        if (this._inputManager?.z)
        {
            // get player/camera's forward vector
            let forward: Vector3 = this.xrCamera.getDirection(Vector3.Forward());

            // +1 = forwards, -1 = backwards
            let input: number = -(this._inputManager.z/Math.abs(this._inputManager.z));

            // multiply player's forward vector by direction and speed
            let direction: Vector3 = forward.scaleInPlace(input * PlayerController.SPEED);

            // add resulting vector to camera's current position vector
            this._moveDirection =  this.xrCamera.position.addInPlace(direction);

            // ask Courtney how to set this to user's height...using this.xrCamera.position.y still flies
            this._moveDirection.y = 1.6;      // so user can't go flying up in the air

            // set camera's new position
            this.xrCamera.position = this._moveDirection;

            // this is a hacky workaround for the collider because the WebXRCamera collider doesn't DO anything
            this.collider.position = this.xrCamera.position;
        }
    }

    public set inputManager(input: InputManager)
    {
        this._inputManager = input;
    }
}