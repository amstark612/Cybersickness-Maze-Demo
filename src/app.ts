import { Color4, Engine, FreeCamera, Scene } from "@babylonjs/core";
import { WebXRCamera, WebXRInputSource } from "@babylonjs/core/XR";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";

// custom classes
import { Environment } from "./environment";
import { UI } from "./UI";
import { PlayerController } from "./playerController";
import { InputManager } from "./inputManager";

// side effects
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
// import "@babylonjs/loaders/glTF";

enum State { START = 0, PRETEST = 1, MAIN = 2, POSTTEST = 3 }

class App
{
    // general app stuff
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    // scene stuff
    private _state: number = 0;
    private _mainScene: Scene;
    private _pretestScene: Scene;

    // game state stuff
    private _environment: Environment;

    // player stuff
    private _inputManager: InputManager;
    private _playerController: PlayerController;
    private _player: WebXRCamera | null;
    private _playerCollider: Mesh;

    constructor()
    {
        // get canvas & initialize babylon scene and 3D engine
        this._canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        // call main render loop & state machine
        this._main();
    }

    private async _main() : Promise<void>
    {
        await this._goToStart();

        // render loop
        this._engine.runRenderLoop(() =>
        {
            switch (this._state)
            {
                case State.START:
                    this._scene.render();
                    break;
                case State.PRETEST:
                    this._scene.render();
                    break;
                case State.MAIN:
                    this._update();
                    this._scene.render();
                    break;
                case State.POSTTEST:
                    this._scene.render();
                    break;
                default: break;
            }
        });

        // resize if window is resized
        window.addEventListener('resize', () =>
        {
            this._engine.resize();
        });
    }

    private _update() : void
    {
        this._inputManager?.processControllerInput();
        this._playerController?.updateMovement();
    }

    private async _setUpGame() : Promise<void>
    {
        let leftController: WebXRInputSource;
        let rightController: WebXRInputSource;

        // create scene
        const scene = new Scene(this._engine);
        this._mainScene = scene;

        // create environment
        this._environment = new Environment(scene);
        await this._environment.load().then(res => {
                // set up (backup) non-VR camera & collider
                this._playerController = new PlayerController(scene, this._canvas);
        });

        // set up XR camera, collider, controllers
        await this._playerController.loadXR().then(res => {
                this._player = this._playerController.xrCamera;
                this._playerCollider = this._playerController.playerCollider;

                this._playerController.xrHelper.input.onControllerAddedObservable.add((inputSource) => {
                    if (inputSource.uniqueId.endsWith("left"))
                    {
                        leftController = inputSource;
                    }
                    else
                    {
                        rightController = inputSource;
                    }

                    // create input manager
                    this._inputManager = new InputManager(this._scene, leftController, rightController);

                    // this might be a hacky workaround for a circular dependency...? bug Courtney?
                    this._playerController.setInputManager(this._inputManager);
                });
        });
    }

    private async _goToStart() : Promise<void>
    {
        // display loading screen while loading
        this._engine.displayLoadingUI();


        // create scene and camera
        this._scene.detachControl();
        const scene = new Scene(this._engine);
        //scene.clearColor = new Color4(0, 0, 0, 1);
        const camera = new FreeCamera("camera1", Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());


        // create fullscreen UI for GUI elements
        const guiMenu = new UI("UI");

        // print instructions
        guiMenu.createMsg("Some intructions and lorem ipsum and stuff");

        // create a button
        const startBtn = guiMenu.createBtn("NEXT");

        startBtn.onPointerDownObservable.add(() =>
        {
            this._goToPretest();
            scene.detachControl();
        })


        // after scene loads
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to start state
        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;
    }

    private async _goToPretest() : Promise<void>
    {
        // display loading screen while loading
        this._engine.displayLoadingUI();

        // create scene and camera
        this._scene.detachControl();
        this._pretestScene = new Scene(this._engine);
        // this._loadScene.clearColor = new Color4(0, 0, 0, 1);
        const camera = new FreeCamera("camera1", Vector3.Zero(), this._pretestScene);
        camera.setTarget(Vector3.Zero());


        // create fullscreen UI for GUI elements
        const loadingUI = new UI("Pretest UI");

        // // create prettest questionnaire
        // loadingUI.createSSQ();

        // create a button
        const nextBtn = loadingUI.createBtn("NEXT");

        nextBtn.onPointerDownObservable.add(() =>
        {
            // loadingUI.submitSSQ();
            this._goToGame();
        })


        // after scene loads
        await this._pretestScene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to start state
        this._scene.dispose();
        this._scene = this._pretestScene;
        this._state = State.PRETEST;

        // start loading and setting up game during this scene
        let finishedLoading = false;
        await this._setUpGame().then(res => {
            finishedLoading = true;
            // this._goToGame();
        });

        // this._scene.debugLayer.show();
    }

    private async _goToGame() : Promise<void>
    {
        // set up scene
        this._scene.detachControl();
        const scene = this._mainScene;


        // create fullscreen UI for GUI elements
        const playerUI = new UI("Player UI");
        scene.detachControl(); 

        // create a button
        const endBtn = playerUI.createBtn("EXIT");

        endBtn.onPointerDownObservable.add(() =>
        {
            this._goToEnd();
        })

        // create discomfort score popup for checkpoints
        const dsPrompt = playerUI.createDSPrompt();


        // get rid of start scene and switch to gameScene
        this._scene.dispose();
        this._state = State.MAIN;
        this._scene = scene;
        this._engine.hideLoadingUI();

        // reattach control now that scene is ready
        this._scene.attachControl();







        // a bunch of temporary stuff please clean me up

        // Our built-in 'sphere' shape.
        let sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 32 }, scene);
        sphere.checkCollisions = true;

        // Move the sphere upward and forward
        sphere.position = new Vector3(0, 1, 2);

        // Add action to sphere
        sphere.actionManager = new ActionManager(scene);
        sphere.actionManager.registerAction(
            new ExecuteCodeAction(
                { 
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: { mesh: this._playerCollider }
                },
                () => 
                {
                    // disable locomotion!!!
                    dsPrompt.isVisible = true;
                }
            )
        );


        scene.debugLayer.show();
        
    }

    private async _goToEnd() : Promise<void> {
        await this._playerController.xrHelper.baseExperience.exitXRAsync();

        // display loading screen while loading
        this._engine.displayLoadingUI();


        // create scene and camera
        this._scene.detachControl();
        const scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        const camera = new FreeCamera("camera1", Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());


        // create fullscreen UI for GUI elements
        const guiMenu = new UI("End UI");

        // display instructions
        guiMenu.createMsg("Instructions for zipping and uploading data or maybe, instead, a button that trigger script for automatically zipping and uploading data or launches link to post-experiment questionnaire");

        // create a button
        const uploadBtn = guiMenu.createBtn("UPLOAD");
        // would need to attach to some script or something here


        // after scene loads
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to end state
        this._scene.dispose();
        this._scene = scene;
        this._state = State.POSTTEST;
    }
}

var game = new App();