import { Engine, FreeCamera, Scene } from "@babylonjs/core";
import { WebXRControllerComponent, WebXRInputSource } from "@babylonjs/core/XR";
import { Vector3 } from "@babylonjs/core/Maths/math";

// custom classes
import { Environment } from "./Environment";
import { UI } from "./UI";
import { UIInfo } from "./UIInfo";
import { PlayerController } from "./PlayerController";
import { InputManager } from "./InputManager";
import { Trial } from "./Trial";

// side effects
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

enum State { START = 0, PAUSED = 1, MAIN = 2, POSTTEST = 3 }

export class App {
    // general app stuff
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    // scene stuff
    public _state: number = 0;
    private _mainScene: Scene;

    // game state stuff
    private _environment: Environment;
    private _mainUI: UI = null;
    private _trial: Trial;

    // player stuff
    private _inputManager: InputManager = null;
    private _playerController: PlayerController = null;

    constructor() {
        // get canvas & initialize babylon scene and 3D engine
        this._canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        // call main render loop & state machine
        this._main();
    }

    private async _main() : Promise<void> {
        await this._goToStart();

        // render loop
        this._engine.runRenderLoop(() => {
            switch (this._state) {
                case State.START:
                    this._scene.render();
                    break;
                case State.PAUSED:
                    this._update();
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

    private _update() : void {
        this._inputManager?.updateControllerInput();
    }

    // ugly solution for changing game state from UI class
    public changeGameState(state: State) : void {
        switch(state) {
            case State.PAUSED:
                // how to get rid of this ugly special case?
                if (this._state == State.START) {
                    this._goToGame();
                }
                this._playerController.enableLocomotion = false;
                this._state = State.PAUSED;
                break;
            case State.MAIN:
                this._playerController.enableLocomotion = true;
                this._state = State.MAIN;
                break;
            case State.POSTTEST:
                this._goToEnd();
                this._state = State.POSTTEST;
                break;
            default:
                break;
        }
    }

    // executed when notified by input manager
    private _processControllerInput(component: WebXRControllerComponent) : void {
        // for locomotion
        if (component.id == "xr-standard-thumbstick") {
            this._playerController.updateMovement(component.axes.y, this._engine);
        }
        // for calling pause menu
        else if (component.id == "a-button" || component.id == "x-button") {
            this.changeGameState(State.PAUSED);
            this._mainUI.pauseMenu.isVisible = true;
        }
    }

    // executed when notified by UI
    private _processUInotifications(input: UIInfo) : void {
        if (input.newTrial) {
            // ugghhhh is there some elegant way to get rid of this special case?
            if (input.rightHanded != null) {
                // set primary controller
                this._inputManager.setPrimaryController(input.rightHanded);                
            }
            
            // again, how to get rid of this?
            if (input.discomfortScore >= 0) {
                // check if there is a discomfort score and do something with it if there is
                console.log(input.discomfortScore);
            }

            // begin new trial
            this._trial = new Trial(this._playerController.xrCamera, this._playerController.collider, 1, this._mainScene);
            // trial will only notify app upon user collecting final coin:
            this._trial.add(trialInput => {
                this.changeGameState(State.PAUSED);
                this._mainUI.DSpopup.isVisible = true;
                console.log(trialInput.coinsCollected);
            });                        
        }
        
        else if (input.findMyWay) {
            this._playerController.setPosition(this._trial.lastPosition);
        }

        this.changeGameState(input.gameState);
    }

    private async _setUpMainScene() : Promise<void> {
        // create main scene
        this._mainScene = new Scene(this._engine);

        // create & load environment
        this._environment = new Environment(this._mainScene);
        await this._environment.load().then(res => {
                // set up (backup) non-VR camera & collider
                this._playerController = new PlayerController(this._mainScene, this._canvas);
        });

        // // set up XR camera, collider, controllers
        // await this._playerController.loadXR().then(() => {
        //     this._playerController.xrHelper.input.onControllerAddedObservable.add((inputSource) => {
        //         this._setUpXR(inputSource);

        //         // make it rain coins now that we have a player collider
        //         this._environment.generateCoins(this._playerController.collider);

        //         // hide loading screen and reattach control now that scene is ready
        //         this._engine.hideLoadingUI();
        //         this._scene.attachControl();
        //     });
        // });

        // // create (an initially invisible) pause menu & discomfort score prompt
        // this._mainUI = new UI("Player UI", true, this._mainScene, this._playerController.collider);
        // // subscribe to UI notifications for pausing/unpausing game during popups & getting handedness
        // this._mainUI.add((input) => this._processUInotifications(input));
    }

    // sets up XR & input manager
    private _setUpXR(inputSource: WebXRInputSource) : void {
        let leftController: WebXRInputSource;
        let rightController: WebXRInputSource;

        if (inputSource.uniqueId.endsWith("left")) {
            leftController = inputSource;
        }
        else {
            rightController = inputSource;
        }

        // create input manager
        this._inputManager = new InputManager(this._scene, leftController, rightController);
        // subscribe to input manager notifications for movement and calling pause menu
        this._inputManager.add((component) => this._processControllerInput(component));
    }

    private async _goToStart() : Promise<void> {
        // display loading screen while loading
        this._engine.displayLoadingUI();

        // create scene and camera
        this._scene = new Scene(this._engine);
        const camera: FreeCamera = new FreeCamera("camera1", Vector3.Zero(), this._scene);
        camera.setTarget(Vector3.Zero());
        
        // create fullscreen UI for GUI elements
        const guiMenu: UI = new UI("UI", false);
        // subscribe to UI notifications so start button works
        guiMenu.add(input => this._processUInotifications(input));

        await this._setUpMainScene().then(() => {
                guiMenu.createStartScreen(this._scene);
        });

        // after scene loads
        await this._scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to start state
        this._state = State.START;



        this._scene.debugLayer.show();
    }

    private async _goToGame() : Promise<void> {
        // get rid of start scene and switch to game scene
        this._scene.detachControl();
        this._scene.dispose();
        this._state = State.PAUSED;
        this._scene = this._mainScene;

        // this needs to stay in this function so user doesn't enter XR BEFORE hitting "Begin"
        // set up XR camera, collider, controllers
        await this._playerController.loadXR().then(() => {
            this._playerController.xrHelper.input.onControllerAddedObservable.add(inputSource => {
                this._setUpXR(inputSource);

                // hide loading screen and reattach control now that scene is ready
                this._engine.hideLoadingUI();
                this._scene.attachControl();
            });
        });

        // create (an initially invisible) pause menu & discomfort score prompt
        this._mainUI = new UI("Player UI", true, this._mainScene, this._playerController.collider);
        // subscribe to UI notifications for pausing/unpausing game during popups & getting handedness
        this._mainUI.add(input => this._processUInotifications(input));

        this._scene.debugLayer.show();
    }

    private async _goToEnd() : Promise<void> {
        await this._playerController.xrHelper.baseExperience.exitXRAsync();

        // display loading screen while loading
        this._engine.displayLoadingUI();

        // create scene and camera
        this._scene.detachControl();
        const scene: Scene = new Scene(this._engine);
        const camera: FreeCamera = new FreeCamera("camera1", Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());

        // create fullscreen UI for GUI elements
        const guiMenu: UI = new UI("End UI", false);
        guiMenu.createEndScreen();

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