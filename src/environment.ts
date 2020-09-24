import { MeshBuilder, Scene } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";


export class Environment
{
    private _scene: Scene;

    constructor(scene: Scene)
    {
        this._scene = scene;
    }

    public async load()
    {
        const xrHelper = await this._scene.createDefaultXRExperienceAsync({ disableTeleportation: true });

        const xrCamera = xrHelper.baseExperience.camera;

        xrCamera.name = "XR Camera";
        xrCamera.applyGravity = true;
        xrCamera.checkCollisions = true;

        // // Ground stuff ###########################################################
        // // ########################################################################
        
        // Our built-in 'ground' shape.
        var ground = MeshBuilder.CreateGround("ground", { width: 25, height: 25 }, this._scene);

        // Enable collisions on ground
        ground.checkCollisions = true;

        // // Load texture from local directory
        //var gridTexture = new Texture("textures/grid.png", scene);

        // // Create groundMaterial
        // var groundMaterial = new StandardMaterial("groundmaterial", scene);

        // // Attach gridTexture to groundMaterial
        //groundMaterial.diffuseTexture = gridTexture;

        // // Apply groundMaterial to ground
        // ground.material = groundMaterial;

        // ########################################################################
        // ########################################################################

        // Create walls
        var leftWall = MeshBuilder.CreateBox("left wall", { width: 15, height: 3, depth: 0.3 }, this._scene);
        leftWall.checkCollisions = true;
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position = new Vector3(-3, 1.5, 4);

        var rightWall = leftWall.clone();
        rightWall.name = "right wall";
        rightWall.position.x = 3;
    }
}