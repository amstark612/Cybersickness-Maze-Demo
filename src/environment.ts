import { DirectionalLight, HemisphericLight, Scene, SceneLoader } from "@babylonjs/core";
import { StandardMaterial, Texture } from "@babylonjs/core/Materials";
import { SkyMaterial } from "@babylonjs/materials/sky";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { AbstractMesh, Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { WebXRDefaultExperience } from "@babylonjs/core/XR";

// side effects
import "@babylonjs/loaders/glTF/2.0/glTFLoader";


export class Environment
{
    private _scene: Scene;
    public xrHelper: WebXRDefaultExperience;

    constructor(scene: Scene)
    {
        this._scene = scene;
    }

    public async load()
    {
        // load textures
        let wallTexture: Texture = new Texture("assets/textures/brick.png", this._scene);
        wallTexture.uScale = 5;
        wallTexture.vScale = 2;
        let wallMaterial: StandardMaterial = new StandardMaterial("brick", this._scene);
        wallMaterial.diffuseTexture = wallTexture;

        let groundTexture: Texture = new Texture("assets/textures/stone.png", this._scene);
        groundTexture.uScale = 80;
        groundTexture.vScale = 80;
        let groundMaterial: StandardMaterial = new StandardMaterial("stone", this._scene);
        groundMaterial.diffuseTexture = groundTexture;


        // load maze
        let mazeMeshes: AbstractMesh[];
        SceneLoader.ImportMesh("", "assets/models/", "Maze2.glb", this._scene, (meshes) =>
        {
            meshes[0].name = "Maze";
            meshes[0].scaling = new Vector3(2, 2, 2);
            meshes[0].rotation = new Vector3(0, Math.PI, 0);

            mazeMeshes = meshes[0].getChildMeshes();

            mazeMeshes.forEach(element => {
                if (element.getClassName() == "Mesh")
                {
                    element.checkCollisions = true;
                    element.material = wallMaterial;
                }
            });
        });

        this._createSky();
        this._createLights();

        // create gravity
        this._scene.gravity = new Vector3(0, -9.81, 0);

        // enable collisions
        this._scene.collisionsEnabled = true;
        
        // // create invisible ground for physics collisions
        // environment!.ground!.isVisible = false;
        // environment!.ground!.position = new Vector3(0, 0, 0);

        let ground: Mesh = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this._scene);
        ground.position.set(0, 0.02, 0);
        ground.material = groundMaterial;

        // Enable collisions on ground
        ground.checkCollisions = true;
    }

    private _createSky() : void
    {
        // create sky material
        let skyboxMat: SkyMaterial = new SkyMaterial("sky material", this._scene);
        skyboxMat.backFaceCulling = false;
        skyboxMat.luminance = 1;
        skyboxMat.turbidity = 10;
        skyboxMat.mieCoefficient = 0.005;
        skyboxMat.useSunPosition = true;
        skyboxMat.sunPosition = new Vector3(10, 50, 10);

        // create skybox
        const skybox: Mesh = Mesh.CreateBox("skyBox", 100, this._scene);
        skybox.material = skyboxMat;
    }

    private _createLights() : void
    {
        // ambient light to illuminate objects
        let ambientlight: HemisphericLight = new HemisphericLight("ambient", Vector3.Up(), this._scene);
        ambientlight.intensity = 1.0;
        ambientlight.diffuse = new Color3(0.7, 0.7, 0.7);

        // directional light for more definition in shadows
        let directionalLight: DirectionalLight = new DirectionalLight("sunlight", Vector3.Down(), this._scene);
        directionalLight.intensity = 0.6;
    }

    private _createCoin(collider: Mesh, position: Vector3) : void
    {
        let coin: Mesh = MeshBuilder.CreateSphere("Coin", { diameter: 0.3, segments: 32 }, this._scene);
        coin.position = position;
        coin.checkCollisions = true;

        coin.actionManager = new ActionManager(this._scene);
        coin.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: { mesh: collider }
                },
                () =>
                {
                    coin.isVisible = false;
                }
            )
        )
    }

    public generateCoins(collider: Mesh) : void
    {
        // create an array of positions for coins
        // is it possible to do new Vector3(tuple) & use array of tuples? test later
        const coins = [
            // new Vector3(0, 1, 2),
            new Vector3(0, 1, 4),
            new Vector3(0, 1, 6),
            new Vector3(1, 1, 6),
            new Vector3(3, 1, 6)
        ]

        coins.forEach((position) => {
            this._createCoin(collider, position);
        });
    }
}