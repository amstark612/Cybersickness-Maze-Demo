import { FreeCamera, Mesh, MeshBuilder, Scene, TransformNode, WebXRCamera, WebXRDefaultExperience } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Axis } from "@babylonjs/core";

export class PlayerController
{
    public xrHelper: WebXRDefaultExperience;
    public xrCamera: WebXRCamera;
    public playerNode: TransformNode;
    public collider: Mesh;
    public enableLocomotion: boolean = false;

    public last: number = 0;    // for storing camera's last y-rotation

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

        // create empty node that will be pause menu's pivot
        this.playerNode = new TransformNode("Player node");
        this.playerNode.position = this.collider.position;
        // parent to collider
        this.playerNode.setParent(this.collider);

        // this.collider = this._createXRCollider(parent);


        // let children = this.xrCamera.rigCameras;
        // console.log(children.length);
        // children.forEach((child) => {
        //     child.parent = this.collider;
        // });

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

        // temporary/debugging
        // let position: Vector3 = this.xrCamera.position;
        collider.position = this.xrCamera.position;
        // collider.position.set(position.x, 1.6, position.z + 3);
        // collider.position.set(0, 2, 2);

        return collider;
    }

    public updateMovement(value: number) : void
    {
        if (this.enableLocomotion)
        {
            // +1 = forwards, -1 = backwards
            let input: number = -(value/Math.abs(value));

            // get player/camera's forward vector
            let forward: Vector3 = this.xrCamera.getDirection(Vector3.Forward());
        
            // multiply player's forward vector by direction and speed
            forward.scaleInPlace(input * PlayerController.SPEED);
            forward.y = 0;    // so user can't go flying up in the air   

            // // DELETE ME AFTER FIXING
            // let line: Vector3[] = [this.xrCamera.position, forward];
            // MeshBuilder.CreateLines("forward", { points: line });

            this.collider.moveWithCollisions(forward);
        }
    }

    public updateRotation() : void
    {
        // update collider's rotation to match camera
        let next: number = this.xrCamera.getDirection(Vector3.Forward()).z;
    
        this.collider.rotate(Axis.Y, next - this.last);

        this.last = next;
    }
}