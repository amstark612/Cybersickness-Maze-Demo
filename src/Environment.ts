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
    private _wallMaterial: StandardMaterial;
    private _coinMaterial: StandardMaterial;

    constructor(scene: Scene) {
        this._scene = scene;
        this._parent = new TransformNode("Environment");
        this._loadTextures();
    }

    private _loadTextures() : void {
        let wallTexture: Texture = new Texture("assets/textures/tile.png", this._scene);
        wallTexture.uScale = 11;
        wallTexture.vScale = 10;
        this._wallMaterial = new StandardMaterial("wall material", this._scene);
        this._wallMaterial.specularTexture = new Texture("assets/textures/tilen.png", this._scene);
        this._wallMaterial.bumpTexture = new Texture("assets/textures/tile.png", this._scene);
        this._wallMaterial.bumpTexture.level = 0.3;
        this._wallMaterial.diffuseTexture = wallTexture;

        let coinTexture: Texture = new Texture("assets/textures/gold2.png", this._scene);
        this._coinMaterial = new StandardMaterial("coin material", this._scene);
        this._coinMaterial.bumpTexture = new Texture("assets/textures/gold2n.png", this._scene);
        this._coinMaterial.specularPower = 100;
        this._coinMaterial.diffuseTexture = coinTexture;
    }

    public async load() {
        this._createSky();
        this._createLights(); // and shadows
        this._createGround();
        this._loadMaze(1);    // tutorial maze = maze 0

        // create gravity
        this._scene.gravity = new Vector3(0, -9.81, 0);

        // enable collisions
        this._scene.collisionsEnabled = true;
    }

    private _loadMaze(trialNumber: number) : void {
        let mazeMeshes: AbstractMesh[];
        SceneLoader.ImportMesh("", "assets/models/", "Maze" + trialNumber + ".glb", this._scene, (meshes) => {
            meshes[0].name = "Maze";
            meshes[0].setParent(this._parent);
            meshes[0].rotation.y += Math.PI / 2;

            mazeMeshes = meshes[0].getChildMeshes();

            mazeMeshes.forEach(element => {
                if (element.getClassName() == "Mesh") {
                    element.checkCollisions = true;
                    element.material = this._wallMaterial;
                }
            });
        });
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

    public testing(scene: Scene) : void {
        // load texture
        let coinTexture: Texture = new Texture("assets/textures/gold2.png", scene);
        let coinMaterial: StandardMaterial = new StandardMaterial("coin", scene);
        coinMaterial.bumpTexture = new Texture("assets/textures/gold2n.png", scene);
        coinMaterial.specularPower = 100;
        coinMaterial.diffuseTexture = coinTexture;
                                                                                                                                                        
        // import the mesh of coins
        let coinMeshes: AbstractMesh[];
        SceneLoader.ImportMesh("", "assets/models/", "Trial1.glb", scene, (meshes) => {
            meshes[0].name = "Coins";
            // meshes[0].scaling = new Vector3(1, 0.5, 1);
            // meshes[0].rotation = new Vector3(0, Math.PI / 2, 0);
            // meshes[0].rotation = new Vector3(0, 0, 0);
            
            // lower coins so short people don't get whacked in the face collecting them
            // meshes[0].position.y -= -0.5;
                                                                                                                                                        
            // get actual coins
            coinMeshes = meshes[0].getChildMeshes();
                                                                                                                                                        
            // apply coin texture to first coin (other coins will be instanced meshes of this one)
            coinMeshes[0].material = coinMaterial;
                                                                                                                                                        
            // do not include first coin - first coin is just placemarker for starting position
            for (let index: number = 1; index < coinMeshes.length; index++) {
                // scale coins here b/c too lazy to change them in Unity
                // coinMeshes[index].scaling = new Vector3(0.5, 0.03, 0.5);
                                                                                                                                                        
            }
        });
    }
}
