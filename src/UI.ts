import { Mesh, MeshBuilder, Observable, Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D";
import { Button, Control, Grid, Image, RadioButton, Rectangle, Slider, StackPanel, TextBlock } from "@babylonjs/gui/2D/controls";

enum State { START = 0, PAUSED = 1, MAIN = 2, POSTTEST = 3 }
enum UIMask { CHANGE_GAMESTATE = 1, LOG_DATA = 2, SET_HANDEDNESS = 3, FIND_MY_WAY = 4 }

export class UI extends Observable<{ mask: number, data?: any }> {
    // menus
    private _2Dmenu: AdvancedDynamicTexture;
    public pauseMenu: Mesh;
    public DSpopup: Mesh;

    // discomfort score stuff
    private static readonly DS_MIN: number = 0;
    private static readonly DS_MAX: number = 10;
    private static readonly DS_PROMPT: string = "Discomfort score prompt goes here more words and stuff to fill text block does this text wrap properly? What are the margins? Is the text squashed vertically? WHAT IS LIFE";

    private static readonly PRETEST_PROMPT: string = "Some instructions and stuff";
    private static readonly POSTTEST_PROMPT: string = "Instructions for uploading data or whatever needs to happen after demo";

    // font
    private static readonly FONT_SIZE: number = 36;
    private static readonly TEXT_SCALE_Y: number = 1.3; // for scaling text in 3D; looks weird otherwise for some unknown reason

    constructor(name: string, xr: boolean, scene?: Scene, collider?: Mesh) {
        super();

        if (!xr) {
            // create fullscreen UI for GUI elements
            this._2Dmenu = AdvancedDynamicTexture.CreateFullscreenUI(name);
            this._2Dmenu.idealHeight = 720;
        }
        else {
            this.DSpopup = this._createDSPrompt(collider, scene);
            this.pauseMenu = this._createPauseMenu(collider, scene);
        }
    }

    private _createMsg(message: string, xr: boolean, width?: number, height?: number) : TextBlock {
       const textBox: TextBlock = new TextBlock("Text Box");
       textBox.text = message;
       textBox.textWrapping = true;
       textBox.color = "black";
       textBox.fontSize = UI.FONT_SIZE;

       if (xr) {
           textBox.scaleY = UI.TEXT_SCALE_Y;
           textBox.widthInPixels = width;
           textBox.heightInPixels = height;
       }

       return textBox;
    }

    private _createBtn(name: string, xr: boolean) : Button {
        const btn: Button = Button.CreateSimpleButton(name + " button", name);
        btn.widthInPixels = 300;
        btn.heightInPixels = 100;
        btn.fontSize = UI.FONT_SIZE;
        btn.thickness = 0;    // border

        if (xr) {
            btn.scaleY = UI.TEXT_SCALE_Y;
            btn.background = "white";
            btn.textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        }
        else {
            btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        }

        return btn;
    }

    public createStartScreen(scene: Scene) : void {
        const text: TextBlock = this._createMsg(UI.PRETEST_PROMPT, false);
        const btn: Button = this._createBtn("BEGIN", false);

        btn.onPointerDownObservable.add(() => {
            this.notifyObservers({ mask: UIMask.CHANGE_GAMESTATE, data: State.PAUSED });
            scene.detachControl();
        })

        this._2Dmenu.addControl(text);
        this._2Dmenu.addControl(btn);
    }

    public createEndScreen() : void {
        const text: TextBlock = this._createMsg(UI.POSTTEST_PROMPT, false);

        this._2Dmenu.addControl(text);
    }

    private _createPlane(name: string, parent: Mesh, scene: Scene) : Mesh {
        const plane: Mesh = MeshBuilder.CreatePlane(name, { width: 1, height: 0.5 }, scene);
        plane.position.set(parent.position.x, parent.position.y, parent.position.z + 1);
        plane.setParent(parent);
        plane.isVisible = false;

        return plane;
    }

    private _createGrid(name: string, width: number, height: number, background: boolean) : Grid {
        const grid = new Grid(name);
        grid.widthInPixels = width;
        grid.heightInPixels = height;
        
        if (background) {
            grid.background = "white";
            grid.alpha = 0.75;
        }

        return grid;
    }

    private _createRadioBtn(text: string, group: string) : RadioButton {
        const button: RadioButton = new RadioButton(text);
        button.group = group;
        button.widthInPixels = 30;
        button.heightInPixels = 30;
        button.color = "black";
        button.background = "white";

        return button;
    }

    private _createPauseMenu(parent: Mesh, scene: Scene) : Mesh {
        const plane: Mesh = this._createPlane("Pause Menu", parent, scene);
        const planeADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        // grid for organization
        const grid: Grid = this._createGrid("DS score slider grid", 800, 380, true);
        grid.addRowDefinition(20, true);      // extra column for padding b/c .padding doesn't seem to work
        grid.addRowDefinition(100, true);     // return to game button
        grid.addRowDefinition(20, true);      // extra column for padding b/c .padding doesn't seem to work
        grid.addRowDefinition(100, true);     // find my way button
        grid.addRowDefinition(20, true);      // extra column for padding b/c .padding doesn't seem to work
        grid.addRowDefinition(100, true);     // exit game button
        grid.addRowDefinition(20, true);      // extra column for padding b/c .padding doesn't seem to work

        // create buttons
        const resumeBtn: Button = this._createBtn("Resume", true);
        const findMyWayBtn: Button = this._createBtn("Find My Way", true);
        const exitBtn: Button = this._createBtn("End Game", true);

        // make buttons do stuff
        resumeBtn.onPointerDownObservable.add(() => {
            this.pauseMenu.isVisible = false;
            this.notifyObservers({ mask: UIMask.CHANGE_GAMESTATE, data: State.MAIN });
        });
        findMyWayBtn.onPointerDownObservable.add(() => {
            this.notifyObservers({ mask: UIMask.FIND_MY_WAY });
            this.pauseMenu.isVisible = false;
        })
        exitBtn.onPointerDownObservable.add(() => {
            this.notifyObservers({ mask: UIMask.CHANGE_GAMESTATE, data: State.POSTTEST });
            plane.dispose();
        });

        // attach controls
        planeADT.addControl(grid);
        grid.addControl(resumeBtn, 1, 0);
        grid.addControl(findMyWayBtn, 3, 0);
        grid.addControl(exitBtn, 5, 0);

        return plane;
    }

    public createPoster(parent: Mesh, scene: Scene) : Mesh {
        // create poster
        const plane: Mesh = MeshBuilder.CreatePlane("Poster", { width: 1, height: 1.2 }, scene);
        plane.position.set(parent.position.x, parent.position.y + .1, parent.position.z + 1.5);

        // do this so it shows up right in 3D. dunno why.
        const planeADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        // create background for prompt
        const background: Rectangle = new Rectangle();
        background.widthInPixels = 700;
        background.heightInPixels = 400;
        background.background = "white";
        background.alpha = 0.75;

        // create prompt
        const text: TextBlock = this._createMsg("Please remain still and look at this picture for the next 60 seconds. The picture will automatically disappear after 60 seconds.", true, 700, 400);
        text.fontSize = 42;

        // load puppy pic!
        let puppy: Image = new Image("puppy", "assets/textures/puppy.png");
        puppy.autoScale = true;

        planeADT.addControl(puppy);
        planeADT.addControl(background);
        background.addControl(text);

        return plane;
    }

    private _createDSPrompt(parent: Mesh, scene: Scene) : Mesh {
        const plane: Mesh = this._createPlane("DS Prompt", parent, scene);

        // do this so it shows up right in 3D. don't ask me why because I don't know. DON'T AT ME.
        const planeADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        // create prompt text
        const text: TextBlock = this._createMsg(UI.DS_PROMPT, true, 750, 400);

        // load happy and sad faces
        let sadface: Image = new Image("sadface", "assets/textures/sadface.png");
        let happyface: Image = new Image("happyface", "assets/textures/happyface.png");

        // create slider
        const slider: Slider = new Slider();
        slider.minimum = UI.DS_MIN;
        slider.maximum = UI.DS_MAX;
        slider.value = UI.DS_MAX / 2;        // default value b/c slider starts in the middle
        let rating: number = slider.value;  // to store slider value
        slider.step = 1;
        slider.widthInPixels = 700;
        slider.heightInPixels = 50;
        
        // create header text to display slider value
        const sliderHeader: TextBlock = this._createMsg(slider.value.toString(), true, 100, 75);
        sliderHeader.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        // create submission button
        const submitBtn: Button = this._createBtn("Submit", true);

        // grid for aligning happy/sad faces with slider
        const grid: Grid = this._createGrid("DS score slider grid", 890, 800, true);
        grid.addColumnDefinition(20, true);     // extra column for padding b/c .padding doesn't seem to work
        grid.addColumnDefinition(50, true);     // sad face
        grid.addColumnDefinition(750, true);    // textblock, slider, etc
        grid.addColumnDefinition(50, true);     // happy face
        grid.addColumnDefinition(20, true);     // extra column for padding b/c .padding doesn't seem to work
        grid.addRowDefinition(20, true);        // extra column for padding b/c .padding doesn't seem to work
        grid.addRowDefinition(450, true);       // text block
        grid.addRowDefinition(75, true);        // slider header text
        grid.addRowDefinition(50, true);        // slider
        // empty row between slider and submit button to prevent accidental submission
        grid.addRowDefinition(75, true);
        grid.addRowDefinition(100, true);       // submit button
        grid.addRowDefinition(30, true);     // extra column for padding b/c .padding doesn't seem to work

        // make buttons do stuff
        slider.onValueChangedObservable.add((value) => {
            sliderHeader.text = value.toString();
            rating = value;
        });

        submitBtn.onPointerDownObservable.add(() => {
            this.notifyObservers({ mask: UIMask.LOG_DATA, data: rating });
            rating = UI.DS_MAX / 2;     // reset rating to 10 for next time
            plane.isVisible = false;
        });

        // add controls to grid from top to bottom, left to right
        planeADT.addControl(grid);
        grid.addControl(text, 1, 2);
        grid.addControl(sliderHeader, 2, 2);
        grid.addControl(sadface, 3, 1);
        grid.addControl(slider, 3, 2);
        grid.addControl(happyface, 3, 3);
        grid.addControl(submitBtn, 5, 2);

        return plane;
    }

    public createHandednessPrompt(scene: Scene) : void {
        let rightHanded: boolean = true;

        const plane: Mesh = MeshBuilder.CreatePlane("Handedness prompt", { width: 1.5, height: 1 }, scene);
        plane.position.set(0, 1.6, 2);

        // do this so it shows up right in 3D. don't ask me why because I don't know. DON'T AT ME.
        const planeADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        // create stack panel for organizing things vertically
        // children MUST have height defined in pixels!!!!
        const stackPanel: StackPanel = new StackPanel("Handedness stack panel");

        // grid for radio buttons
        const grid: Grid = this._createGrid("Handedness grid", 800, 100, false);
        grid.addColumnDefinition(400, true);
        grid.addColumnDefinition(400, true);

        // create rectangle for white background
        const background: Rectangle = new Rectangle("Handedness background");
        background.background = "white";
        background.alpha = 0.75;
        background.heightInPixels = 500;
        background.width = 0.75;

        // create prompt text
        const text: TextBlock = this._createMsg("Are you left- or right-handed?", true, 500, 200);

        // create radio buttons
        const leftBtn = this._createRadioBtn("Left", "Handedness");
        const rightBtn = this._createRadioBtn("Right", "Handedness");
        const leftHeader = Control.AddHeader(leftBtn, "Left-handed", "150px", { isHorizontal: true, controlFirst: true });
        const rightHeader = Control.AddHeader(rightBtn, "Right-handed", "150px", { isHorizontal: true, controlFirst: true });

        // create submission button
        const submitBtn: Button = this._createBtn("Submit", true);

        // make buttons do stuff
        leftBtn.onIsCheckedChangedObservable.add(() => {
            rightHanded = false;
        });
        rightBtn.onIsCheckedChangedObservable.add(() => {
            rightHanded = true;
        });

        submitBtn.onPointerDownObservable.add(() => {
            this.notifyObservers({ mask: UIMask.SET_HANDEDNESS, data: rightHanded });
            plane.dispose();
        });

        // attach controls
        planeADT.addControl(background);
        planeADT.addControl(stackPanel);
        stackPanel.addControl(text);
        stackPanel.addControl(grid);
        grid.addControl(leftHeader, 0, 0);
        grid.addControl(rightHeader, 0, 1);
        stackPanel.addControl(submitBtn);
    }
}
