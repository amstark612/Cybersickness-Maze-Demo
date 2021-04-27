import { DirectionalLight, HemisphericLight, Scene, SceneLoader } from "@babylonjs/core";
import { CubeTexture, StandardMaterial, Texture } from "@babylonjs/core/Materials";
// import { SkyMaterial } from "@babylonjs/materials/sky";
import { TerrainMaterial } from "@babylonjs/materials/terrain";
import { AbstractMesh, Mesh, MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { WebXRDefaultExperience } from "@babylonjs/core/XR";

// side effects
import "@babylonjs/loaders/glTF/2.0/glTFLoader";

export class Environment {
    private _scene: Scene;
    public xrHelper: WebXRDefaultExperience;

    private _parent: TransformNode;            // empty node for organizing inspector

    constructor(scene: Scene) {
        this._scene = scene;
        this._parent = new TransformNode("Environment");
    }

    public async load() {
        this._createSky();
        this._createLights();
        this._createGround();

        // create gravity
        this._scene.gravity = new Vector3(0, -9.81, 0);

        // enable collisions
        this._scene.collisionsEnabled = true;
    }

    private _createGround() : void {
        let groundMaterial: TerrainMaterial = new TerrainMaterial("ground material", this._scene);
        groundMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
        groundMaterial.specularPower = 64;
        // mixmap to blend all 3 textures
        groundMaterial.mixTexture = new Texture("assets/textures/mixMap2.png", this._scene);
        groundMaterial.diffuseTexture1 = new Texture("assets/textures/ground.jpg", this._scene);
        groundMaterial.diffuseTexture2 = new Texture("assets/textures/rock.png", this._scene);
        groundMaterial.diffuseTexture3 = new Texture("assets/textures/grass.png", this._scene);
        // scale textures
        groundMaterial.diffuseTexture1.uScale = groundMaterial.diffuseTexture1.vScale = 80;
        groundMaterial.diffuseTexture2.uScale = groundMaterial.diffuseTexture2.vScale = 80;
        groundMaterial.diffuseTexture3.uScale = groundMaterial.diffuseTexture3.vScale = 80;
        groundMaterial.bumpTexture2 = new Texture("assets/textures/rockn.png", this._scene);
        groundMaterial.bumpTexture3 = new Texture("assets/textures/grassn.png", this._scene);

        // boring old ground, keep just in case quest can't handle nice stuff
        // let groundTexture: Texture = new Texture("assets/textures/ground.png", this._scene);
        // groundTexture.uScale = 300;
        // groundTexture.vScale = 300;
        // let groundMaterial: StandardMaterial = new StandardMaterial("ground", this._scene);
        // groundMaterial.disableLighting = true;  // these two lines stop sunlight from reflecting all shiny
        // groundMaterial.emissiveTexture = groundTexture;

        let ground: Mesh = MeshBuilder.CreateGround("ground", { width: 180, height: 180 }, this._scene);
        ground.setParent(this._parent);
        ground.position.set(40, 0.04, -50);
        ground.rotation.y = -45;
        ground.material = groundMaterial;

        // Enable collisions on ground
        ground.checkCollisions = true;
    }

    private _createSky() : void {
        // create sky material
        let skyboxMat: StandardMaterial = new StandardMaterial("skybox", this._scene);
        skyboxMat.backFaceCulling = false;
        skyboxMat.reflectionTexture = new CubeTexture("assets/textures/Skyboxes/BlueSky", this._scene);
        skyboxMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMat.disableLighting = true;

        // old/boring sky, hanging onto settings just in case
        // let skyboxMat: SkyMaterial = new SkyMaterial("sky material", this._scene);
        // skyboxMat.backFaceCulling = false;
        // skyboxMat.luminance = 1;
        // skyboxMat.turbidity = 10;
        // skyboxMat.mieCoefficient = 0.005;
        // skyboxMat.useSunPosition = true;
        // skyboxMat.sunPosition = new Vector3(10, 50, 10);

        // create skybox
        const skybox: Mesh = Mesh.CreateBox("skyBox", 300, this._scene);
        skybox.setParent(this._parent);
        skybox.material = skyboxMat;

        // // create skybox
        // const skybox: Mesh = MeshBuilder.CreateBox("skybox", {size: 300}, this._scene);
        // skybox.setParent(parent);
        // skybox.material = skyboxMat;
    }

    private _createLights() : void {
        // ambient light to illuminate objects
        let ambientLight: HemisphericLight = new HemisphericLight("ambient", new Vector3(25, 75, 25), this._scene);
        ambientLight.parent = this._parent;
        ambientLight.intensity = 3.5;
        ambientLight.diffuse = new Color3(0.7, 0.7, 0.7);

        // directional light for more definition in shadows
        let directionalLight: DirectionalLight = new DirectionalLight("sunlight", new Vector3(-5, -20, 90), this._scene);
        directionalLight.parent = this._parent;
        directionalLight.intensity = 1.6;

    }
}
