import { Engine, FreeCamera, Mesh, Scene } from "@babylonjs/core";
import { WebXRControllerComponent, WebXRInputSource, WebXRSessionManager } from "@babylonjs/core/XR";
import { Vector3 } from "@babylonjs/core/Maths/math";

// custom classes
import { Environment } from "./Environment";
import { UI } from "./UI";
import { UIInfo } from "./UIInfo";
import { PlayerController } from "./PlayerController";
import { InputManager } from "./InputManager";
import { Trial } from "./Trial";
import { DataCollectionManager } from "./DataCollectionManager";

// side effects
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

enum State { START = 0, PAUSED = 1, MAIN = 2, POSTTEST = 3 }

export class App {
    private static readonly TOTAL_NUM_TRIALS = 2;

    // data collection stuff
    private _dataCollector: DataCollectionManager;
    private _collecting: boolean = false;

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
    private _trialNumber: number = 0;  // -1: collect baseline data, 0: stop collecting, 1: first trial

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

    private _update() : void {
        this._inputManager?.updateControllerInput();

        if (this._collecting) {
            this._dataCollector.logFrameInfo(Date.now(), this._trialNumber, this._playerController.velocity, this._state);
        }
    }

    // executed when notified by input manager
    private _processControllerInput(component: WebXRControllerComponent) : void {
        // for locomotion
        if (component.id == "xr-standard-thumbstick") {
            this._playerController.updateMovement(component.axes.y, this._engine.getDeltaTime());
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
                this._startNewTrial(); 
            }
            else {
                // check if there's a score to be logged
                // if so, log it along with trial data
                if (input.discomfortScore >= 0) {
                    this._dataCollector.logTrialInfo(this._trialNumber, input.discomfortScore);
                }

                // end program if user is too sick or just completed final trial
                if (input.discomfortScore == 10 || this._trialNumber == App.TOTAL_NUM_TRIALS) {
                    // end data collection
                    this._collecting = false;
                    this._dataCollector.quitDataCollection();

                    this.changeGameState(State.POSTTEST);
                }
                // otherwise, begin new trial
                else {
                    this._startNewTrial();
                }
            }
        }
        
        else if (input.findMyWay) {
            this._playerController.setOrientation(this._trial.lastAngle);
            this._playerController.setPosition(this._trial.lastPosition);
        }

        this.changeGameState(input.gameState);
    }

    private _startNewTrial() : void {
        // create new trial
        this._trial = new Trial(this._playerController.xrCamera, this._playerController.collider, ++this._trialNumber, this._mainScene);

        // start collecting data
        this._collecting = true;

        // make sure data collector has everything it needs
        this._dataCollector.registerNewTrial(this._trial);
        // this._dataCollector.registerPlayer(this._playerController.xrCamera, this._playerController.xrSessionManager);
        
        // trial will only notify app upon user collecting final coin:
       this._trial.add(() => {
                this.changeGameState(State.PAUSED);
                this._mainUI.DSpopup.isVisible = true;
            },
            2
        ); 
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
        this._inputManager = new InputManager(leftController, rightController);
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
    }

    private async _goToGame() : Promise<void> {
        // get rid of start scene and switch to game scene
        this._scene.detachControl();
        this._scene.dispose();
        this._state = State.PAUSED;
        this._scene = this._mainScene;

        let sessionManager: WebXRSessionManager;

        // this needs to stay in this function so user doesn't enter XR BEFORE hitting "Begin"
        // set up XR camera, collider, controllers
        await this._playerController.loadXR().then(async() => {
            this._playerController.xrHelper.input.onControllerAddedObservable.add(inputSource => {
                this._setUpXR(inputSource);

                // hide loading screen and reattach control now that scene is ready
                this._engine.hideLoadingUI();
                this._scene.attachControl();
            });

            sessionManager = this._playerController.xrHelper.baseExperience.sessionManager;

            // create (an initially invisible) pause menu & discomfort score prompt
            this._mainUI = new UI("Player UI", true, this._mainScene, this._playerController.collider);
            // subscribe to UI notifications for pausing/unpausing game during popups & getting handedness
            this._mainUI.add(input => this._processUInotifications(input));

            // set up data collection manager           
            this._dataCollector = new DataCollectionManager(this._playerController.xrCamera, sessionManager);
        });



        sessionManager.onXRSessionInit.add(async() => {
            await new Promise(resolve => setTimeout(resolve, 2000));    // wait for frame to load before executing the rest

            if (sessionManager.currentFrame) {
                // have user stand in place and stare at poster for 60 seconds while collecting motion tracking data
                let poster: Mesh = this._mainUI.createPoster(this._playerController.collider, this._scene);
                this._collecting = true;    // start collecting baseline data
                await new Promise(resolve => setTimeout(resolve, 6000));    // DON'T FORGET TO ADD A ZERO LATER ON!
                poster.dispose();
                this._collecting = false;    // stop collecting baseline data

                // then get handedness
                this._mainUI.createHandednessPrompt(this._scene);
            }
        });

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