import { FreeCamera, Mesh, MeshBuilder, Scene, WebXRDefaultExperience } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";

export class PlayerController
{
    private _scene: Scene;
    public xrHelper: WebXRDefaultExperience;

    constructor(scene: Scene, canvas: HTMLCanvasElement)
    {
        this._scene = scene;

        // this creates and positions a first-person non-VR camera (non-mesh)
        const camera = new FreeCamera("Default Camera", new Vector3(0, 1.6, -2), scene);
        
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

        const xrCamera = this.xrHelper.input.xrCamera;
        xrCamera.name = "XR Camera";
        xrCamera.applyGravity = true;
        xrCamera.checkCollisions = true;
    }

    public createXRCollider() : Mesh
    {
        // create ellipsoid for VR player collisions
        const collider = MeshBuilder.CreateSphere("Player", { diameterX: 1, diameterY: 2, diameterZ: 1 });
        collider.visibility = 0;
        collider.checkCollisions = true;

        return collider;
    }
}