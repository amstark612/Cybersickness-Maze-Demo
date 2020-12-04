import { DirectionalLight, HemisphericLight, Scene, SceneLoader } from "@babylonjs/core";
import { StandardMaterial, Texture } from "@babylonjs/core/Materials";
import { SkyMaterial } from "@babylonjs/materials/sky";
import { AbstractMesh, Mesh, MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { WebXRDefaultExperience } from "@babylonjs/core/XR";

// side effects
import "@babylonjs/loaders/glTF/2.0/glTFLoader";


export class Environment {
    private _scene: Scene;
    public xrHelper: WebXRDefaultExperience;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        // create parent transform node (for organizing inspector)
        let parent: TransformNode = new TransformNode("Environment");

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
        SceneLoader.ImportMesh("", "assets/models/", "MazeNarrow.glb", this._scene, (meshes) => {
            meshes[0].name = "Maze";
            meshes[0].setParent(parent);
            meshes[0].scaling = new Vector3(1, 0.5, 1);
            meshes[0].rotation = new Vector3(0, Math.PI / 2, 0);

            mazeMeshes = meshes[0].getChildMeshes();

            mazeMeshes.forEach(element => {
                if (element.getClassName() == "Mesh") {
                    element.checkCollisions = true;
                    element.material = wallMaterial;
                }
            });
        });

        this._createSky(parent);
        this._createLights(parent);

        // create gravity
        this._scene.gravity = new Vector3(0, -9.81, 0);

        // enable collisions
        this._scene.collisionsEnabled = true;

        let ground: Mesh = MeshBuilder.CreateGround("ground", { width: 200, height: 200 }, this._scene);
        ground.setParent(parent);
        ground.position.set(-75, 0.04, 75);
        ground.material = groundMaterial;

        // Enable collisions on ground
        ground.checkCollisions = true;
    }

    private _createSky(parent: TransformNode) : void {
        // create sky material
        let skyboxMat: SkyMaterial = new SkyMaterial("sky material", this._scene);
        skyboxMat.backFaceCulling = false;
        skyboxMat.luminance = 1;
        skyboxMat.turbidity = 10;
        skyboxMat.mieCoefficient = 0.005;
        skyboxMat.useSunPosition = true;
        skyboxMat.sunPosition = new Vector3(10, 50, 10);

        // create skybox
        const skybox: Mesh = Mesh.CreateBox("skyBox", 300, this._scene);
        skybox.setParent(parent);
        skybox.material = skyboxMat;
    }

    private _createLights(parent: TransformNode) : void {
        // ambient light to illuminate objects
        let ambientLight: HemisphericLight = new HemisphericLight("ambient", Vector3.Up(), this._scene);
        ambientLight.parent = parent;
        ambientLight.intensity = 1.0;
        ambientLight.diffuse = new Color3(0.7, 0.7, 0.7);

        // directional light for more definition in shadows
        let directionalLight: DirectionalLight = new DirectionalLight("sunlight", Vector3.Down(), this._scene);
        directionalLight.parent = parent;
        directionalLight.intensity = 0.6;
    }
}