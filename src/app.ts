import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Color4, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene } from "@babylonjs/core";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D"
import { Button, Rectangle, Control, TextBlock, Slider, StackPanel } from "@babylonjs/gui/2D/controls"
import { Environment } from "./environment";

enum State { START = 0, GAME = 1, END = 2, LOADSCENE = 3 }

class App
{
    // general app stuff
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    // scene stuff
    private _state: number = 0;
    private _gameScene: Scene;
    private _loadScene: Scene;

    // game state stuff
    private _environment;

    constructor()
    {
        // get canvas & initialize babylon scene and 3D engine
        this._canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        // show inspector
        this._scene.debugLayer.show();

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
                case State.LOADSCENE:
                    this._scene.render();
                    break;
                case State.GAME:
                    this._scene.render();
                    break;
                case State.END:
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

    private async _setUpGame()
    {
        // create scene
        let scene = new Scene(this._engine);
        this._gameScene = scene;

        // create environment
        const environment = new Environment(scene);
        this._environment = environment;
        await this._environment.load();
    }

    private async _goToStart()
    {
        // display loading screen while loading
        this._engine.displayLoadingUI();

        // create scene and camera
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        //scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());


        // GUI ################################################################
        // create fullscreen UI for GUI elements
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        // display instructions
        var textBox = new TextBlock("Text Box");
        textBox.text = "Some lorem ipsum and stuff";
        textBox.color = "black";
        textBox.fontSize = 48;
        guiMenu.addControl(textBox);
        textBox.isVisible = true;

        // create a button
        const startBtn = Button.CreateSimpleButton("start", "BEGIN");
        startBtn.width = 0.2;
        startBtn.height = "80px";
        startBtn.color = "white";
        startBtn.top = "-14px";
        startBtn.thickness = 0;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiMenu.addControl(startBtn);

        startBtn.onPointerDownObservable.add(() =>
        {
            this._goToLoadScene();
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

    private async _goToLoadScene() : Promise<void>
    {
        // display loading screen while loading
        this._engine.displayLoadingUI();

        // create scene and camera
        this._scene.detachControl();
        this._loadScene = new Scene(this._engine);
        this._loadScene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", Vector3.Zero(), this._loadScene);
        camera.setTarget(Vector3.Zero());

        // GUI ################################################################
        // create fullscreen UI for GUI elements
        const loadScene = AdvancedDynamicTexture.CreateFullscreenUI("loadScene");
        loadScene.idealHeight = 720;

        // create a button
        const nextBtn = Button.CreateSimpleButton("next", "NEXT");
        nextBtn.width = 0.2;
        nextBtn.height = "40px";
        nextBtn.color = "white";
        nextBtn.top = "-14px";
        nextBtn.thickness = 0;
        nextBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        loadScene.addControl(nextBtn);

        nextBtn.onPointerDownObservable.add(() =>
        {
            this._goToGame();
        })

        // after scene loads
        await this._loadScene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to start state
        this._scene.dispose();
        this._scene = this._loadScene;
        this._state = State.LOADSCENE;

        // start loading and setting up game during this scene
        var finishedLoading = false;
        await this._setUpGame().then(res =>
            {
                finishedLoading = true;
        });

    }

    private async _goToGame()
    {
        // set up scene
        this._scene.detachControl();
        let scene = this._gameScene;

        // Load XR stuff
        const xrHelper = await this._scene.createDefaultXRExperienceAsync({ disableTeleportation: true });


        // Camera stuff ###########################################################
        // ########################################################################

        const xrCamera = xrHelper.baseExperience.camera;

        xrCamera.name = "XR Camera";
        xrCamera.applyGravity = true;
        xrCamera.checkCollisions = true;

        // This creates and positions a first-person camera (non-mesh)
        var camera = new FreeCamera("camera1", new Vector3(0, 3, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // Apply gravity to camera
        camera.applyGravity = true;

        // This attaches the camera to the canvas
        camera.attachControl(this._canvas, true);

        // Set ellipsoid around camera to represent user
        camera.ellipsoid = new Vector3(1, 1, 1);

        // Enable collisions on user
        camera.checkCollisions = true;

        // ########################################################################        
        // ########################################################################


        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Create gravity
        scene.gravity = new Vector3(0, -9.81, 0);

        // Enable collisions
        scene.collisionsEnabled = true;

        




        // GUI ####################################################################
        // ########################################################################        

        // create fullscreen UI for GUI elements
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        playerUI.idealHeight = 720;
        scene.detachControl(); 

        // create a button
        const endBtn = Button.CreateSimpleButton("exit", "EXIT");
        endBtn.width = 0.2;
        endBtn.height = "40px";
        endBtn.color = "white";
        endBtn.top = "-14px";
        endBtn.thickness = 0;
        endBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(endBtn);

        endBtn.onPointerDownObservable.add(() =>
        {
            this._goToEnd();
            scene.detachControl();
        })

        // create container
        const rect1 = new Rectangle();
        rect1.width = 0.8;
        rect1.height = "300px";
        rect1.cornerRadius = 20;
        // rect1.color = "Orange";
        // rect1.thickness = 4;
        rect1.background = "white";
        rect1.alpha = 0.7;
        playerUI.addControl(rect1);
        rect1.isVisible = false;

        const panel = new StackPanel();
        rect1.addControl(panel);

        const textBox = new TextBlock("Text Box");
        textBox.text = "Words go here";
        textBox.color = "black";
        textBox.fontSize = 24;
        textBox.height = "200px";
        textBox.width = "400px";
        panel.addControl(textBox);

        const sliderHeader = new TextBlock();
        sliderHeader.text = "5";
        sliderHeader.color = "black";
        sliderHeader.fontSize = 24;
        sliderHeader.height = "40px";
        panel.addControl(sliderHeader); 

        const slider = new Slider();
        var rating;
        slider.minimum = 0;
        slider.maximum = 10;
        slider.value = 5;
        slider.step = 1;
        slider.height = "20px";
        slider.width = "400px";
        slider.onValueChangedObservable.add(function(value) {
            sliderHeader.text = value.toString();
            rating = value;
        });
        panel.addControl(slider);

        const submitBtn = Button.CreateSimpleButton("submit", "Submit");
        submitBtn.width = 0.2;
        submitBtn.height = "80px";
        submitBtn.color = "black";
        submitBtn.top = "-14px";
        submitBtn.thickness = 0;
        submitBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        panel.addControl(submitBtn);

        submitBtn.onPointerDownObservable.add(() =>
        {
            console.log(rating);
        })

        // ########################################################################        
        // ########################################################################




        // get rid of start scene and switch to gameScene
        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;
        this._engine.hideLoadingUI();

        // reattach control now that scene is ready
        this._scene.attachControl();




        
        // FOR THE LOVE OF GOD, FIGURE OUT WHY XRCAMERA.ELLIPSOID CANNOT .INTERSECTSMESH?????!!!!
        var xrCameraCollider = MeshBuilder.CreateCylinder("Camera Collider", { height: 2, diameter: 1, }, scene );
        xrCameraCollider.visibility = 0;
        xrCameraCollider.checkCollisions = true;
        xrCameraCollider.position = xrCamera.position;


        // a bunch of temporary stuff please clean me up

        // Our built-in 'sphere' shape.
        var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 32 }, scene);
        sphere.checkCollisions = true;

        // Move the sphere upward and forward
        sphere.position = new Vector3(0, 1, 2);

        // Add action to sphere
        sphere.actionManager = new ActionManager(scene);
        sphere.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPickTrigger, () => 
                { 
                    if (!rect1.isVisible)
                    {
                        rect1.isVisible = true;
                    }
                    else
                    {
                        rect1.isVisible = false;
                    }
                }
                // { 
                //     trigger: ActionManager.OnIntersectionEnterTrigger,
                //     parameter: { mesh: xrCameraCollider }
                // },
                // () => { console.log("You intersected me?"); }
            )
        );


        scene.debugLayer.show();
        
    }

    private async _goToEnd() : Promise<void> {
        // display loading screen while loading
        this._engine.displayLoadingUI();

        // create scene and camera
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());

        // GUI ################################################################
        // create fullscreen UI for GUI elements
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        // display instructions
        var textBox = new TextBlock("Text Box");
        textBox.text = "Some lorem ipsum and stuff";
        textBox.color = "black";
        textBox.fontSize = 48;
        guiMenu.addControl(textBox);
        textBox.isVisible = true;

        // create a button
        const btn = Button.CreateSimpleButton("end", "END");
        btn.width = 0.2;
        btn.height = "40px";
        btn.color = "white";
        btn.top = "-14px";
        btn.thickness = 0;
        btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiMenu.addControl(btn);

        // display additional instructions, possibly
        // a button to automatically download zip file
        // and sent it or something

        // after scene loads
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        // set current state to end state
        this._scene.dispose();
        this._scene = scene;
        this._state = State.END;
    }
}

new App();