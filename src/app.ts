import { Color4, Engine, FreeCamera, Scene } from "@babylonjs/core";
import { WebXRInputSource } from "@babylonjs/core/XR";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Button } from "@babylonjs/gui/2D/controls";

// custom classes
import { Environment } from "./environment";
import { UI } from "./UI";
import { PlayerController } from "./playerController";
import { InputManager } from "./inputManager";

// side effects
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";


enum State { START = 0, MAIN = 1, POSTTEST = 2 }

class App
{
    // general app stuff
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    // scene stuff
    private _state: number = 0;
    private _mainScene: Scene;

    // game state stuff
    private _environment: Environment;
    private _UI: UI;

    // player stuff
    private _inputManager: InputManager;
    private _playerController: PlayerController;

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

        if (!this._UI.gamePaused)
        {
            this._playerController?.updateMovement();
        }
    }

    private async _setUpGame() : Promise<void>
    {
        // let leftController: WebXRInputSource;
        // let rightController: WebXRInputSource;

        // create scene
        const scene: Scene = new Scene(this._engine);
        this._mainScene = scene;

        // create environment
        this._environment = new Environment(scene);
        await this._environment.load().then(res => {
                // set up (backup) non-VR camera & collider
                this._playerController = new PlayerController(scene, this._canvas);
        });
    }

    private _setUpXR(inputSource: WebXRInputSource) : void
    {
        let leftController: WebXRInputSource;
        let rightController: WebXRInputSource;

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
        this._playerController.inputManager = this._inputManager;
    }

    private async _goToStart() : Promise<void>
    {
        // display loading screen while loading
        this._engine.displayLoadingUI();


        // create scene and camera
        this._scene.detachControl();
        const scene: Scene = new Scene(this._engine);
        //scene.clearColor = new Color4(0, 0, 0, 1);
        const camera: FreeCamera = new FreeCamera("camera1", Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());


        // create fullscreen UI for GUI elements
        const guiMenu: UI = new UI("UI");

        // print instructions
        guiMenu.createMsg("Some instructions and stuff");

        await this._setUpGame().then(() => {
            // create a button
            const startBtn: Button = guiMenu.createBtn("NEXT");

            startBtn.onPointerDownObservable.add(() =>
            {
                this._goToGame();
                scene.detachControl();
            });
        });

        // after scene loads
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to start state
        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;
    }

    private async _goToGame() : Promise<void>
    {
        // set up scene
        this._scene.detachControl();
        const scene = this._mainScene;

        // get rid of start scene and switch to gameScene
        this._scene.dispose();
        this._state = State.MAIN;
        this._scene = scene;

        // set up XR camera, collider, controllers
        await this._playerController.loadXR().then(() => {
            this._playerController.xrHelper.input.onControllerAddedObservable.add((inputSource) => {
                this._setUpXR(inputSource);

                // make it rain coins now that we have a player collider
                this._environment.generateCoins(this._playerController.collider);

                // hide loading screen and reattach control now that scene is ready
                this._engine.hideLoadingUI();
                this._scene.attachControl();
            });
        });

        // create discomfort score prompt
        this._UI = new UI("Player UI");
        this._UI.createDSPrompt(scene);

        // get & set handedness
        const handednessPrompt: Mesh = this._UI.createHandednessPrompt(scene);
        
        
        handednessPrompt.position.set(0, 1.6, 1.5);



        // a bunch of temporary stuff please clean me up


        // Our built-in 'sphere' shape.
        let sphere = MeshBuilder.CreateSphere("sphere", { diameterX: 0.3, diameterY: 0.3, diameterZ: 0.1, segments: 32 }, scene);
        sphere.checkCollisions = true;

        // Move the sphere upward and forward
        sphere.position = new Vector3(0, 1, 2);

        // Add action to sphere
        sphere.actionManager = new ActionManager(scene);
        sphere.actionManager.registerAction(
            new ExecuteCodeAction(
                { 
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: { mesh: this._playerController.collider }
                },
                () => 
                {
                    let position: Vector3 = this._playerController.collider.position;
                    this._UI.DSpopup.position.set(position.x, 1.6, position.z + 1.5);
                    this._UI.DSpopup.isVisible = true;
                    this._UI.gamePaused = true;
                    sphere.dispose();
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
        const scene: Scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        const camera: FreeCamera = new FreeCamera("camera1", Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());

        // create fullscreen UI for GUI elements
        const guiMenu: UI = new UI("End UI");

        // display instructions
        guiMenu.createMsg("Instructions for uploading data or whatever needs to happen after demo");

        // after scene loads
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to end state
        this._scene.dispose();
        this._scene = scene;
        this._state = State.POSTTEST;
    }
}

var game: App = new App();