import { Color4, Engine, FreeCamera, Scene } from "@babylonjs/core";
import { WebXRControllerComponent, WebXRInputSource } from "@babylonjs/core/XR";
import { MeshBuilder } from "@babylonjs/core/Meshes";
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


enum State { START = 0, SETUP = 1, MAIN = 2, POSTTEST = 3 }
enum GameState { PAUSE = 0, RUNNING = 1, END = -1 }

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
    private _UI: UI = null;

    // player stuff
    private _inputManager: InputManager = null;
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
                // case State.SETUP:
                //     if (this._UI && !this._UI.gamePaused)
                //     {
                //         this._inputManager?.setPrimaryController(this._UI.handedness);
                //         this._state = State.MAIN;
                //     }
                //     this._scene.render();
                //     break;
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

    // renders every loops
    private _update() : void
    {
        this._inputManager?.processControllerInput();
    }

    // executed when notified by input manager
    private _processControllerInput(component: WebXRControllerComponent) : void
    {
        if (component.id == "a-button" || component.id == "x-button")
        {
            this._playerController.enableLocomotion = false;
            this._UI.pauseMenu.isVisible = true;
        }

        if (component.id == "xr-standard-thumbstick")
        {
            this._playerController.updateMovement(component.axes.y);
        }
    }

    // executed when notified by UI
    private _processUInotifications(input: { gameState: GameState, rightHanded?: boolean}) : void
    {
        this._playerController.enableLocomotion = input.gameState == GameState.RUNNING ? true : false;

        // set handedness before beginning demo
        if (input.rightHanded!)
        {
            this._inputManager.setPrimaryController(input.rightHanded);
        }
        else if (input.gameState == -1)
        {
            this._goToEnd();
        }
    }

    private async _setUpGame() : Promise<void>
    {
        // create scene
        const scene: Scene = new Scene(this._engine);
        this._mainScene = scene;

        // create & load environment
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
        // subscribe to input manager notifications for movement and calling popup menu
        this._inputManager.add((component) => this._processControllerInput(component));
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
            const startBtn: Button = guiMenu.createBtn("BEGIN");

            startBtn.onPointerDownObservable.add(() =>
            {
                this._goToGame();
                startBtn.dispose();
                scene.detachControl();
            });
        });


        // after scene loads
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to start state
        this._scene = scene;
        this._state = State.START;
    }

    // keeping here in case game logic becomes complicated; will split this of from goToGame()
    // private async _goToSetup() : Promise<void>
    // {
    //     // set up scene
    //     this._scene.detachControl();
    //     const scene = this._mainScene;

    //     // get rid of start scene and switch to game scene
    //     this._scene.dispose();
    //     this._state = State.SETUP;
    //     this._scene = scene;

    //     // set up XR camera, collider, controllers
    //     await this._playerController.loadXR().then(() => {
    //         this._playerController.xrHelper.input.onControllerAddedObservable.add((inputSource) => {
    //             this._setUpXR(inputSource);

    //             // make it rain coins now that we have a player collider
    //             this._environment.generateCoins(this._playerController.collider);

    //             // hide loading screen and reattach control now that scene is ready
    //             this._engine.hideLoadingUI();
    //             this._scene.attachControl();
    //         });
    //     });

    //     // create (an initially invisible) discomfort score prompt
    //     this._UI = new UI("Player UI");
    //     this._UI.createDSPrompt(scene);

    //     // prompt user for handedness
    //     this._UI.getHandedness(scene);
    // }

    private async _goToGame() : Promise<void>
    {
        // get rid of start scene and switch to game scene
        this._scene.detachControl();
        this._scene.dispose();
        this._state = State.MAIN;  // render loop will change to main after getting handedness
        this._scene = this._mainScene;

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

        // create (an initially invisible) menu & discomfort score prompt
        this._UI = new UI("Player UI");
        // subscribe to UI notifications for pausing/unpausing game during popups & getting handedness
        this._UI.add((input) => { this._processUInotifications(input)});
        this._UI.createPauseMenu(this._playerController.collider);
        this._UI.createDSPrompt(this._playerController.collider);

        // prompt user for handedness
        this._UI.getHandedness();



        // a bunch of temporary stuff please clean me up


        // Our built-in 'sphere' shape.
        let sphere = MeshBuilder.CreateSphere("sphere", { diameterX: 0.3, diameterY: 0.3, diameterZ: 0.1, segments: 32 }, this._scene);
        sphere.checkCollisions = true;

        // Move the sphere upward and forward
        sphere.position = new Vector3(0, 1, 2);

        // Add action to sphere
        sphere.actionManager = new ActionManager(this._scene);
        sphere.actionManager.registerAction(
            new ExecuteCodeAction(
                { 
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: { mesh: this._playerController.collider }
                },
                () => 
                {
                    this._UI.DSpopup.isVisible = true;
                    sphere.dispose();
                }
            )
        );

        this._scene.debugLayer.show();
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

new App();