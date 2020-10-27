import { Mesh, MeshBuilder, Observable, TransformNode } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D";
import { Button, Control, Grid, Image, RadioButton, Rectangle, Slider, StackPanel, TextBlock } from "@babylonjs/gui/2D/controls";

enum GameState { PAUSE = 0, RUNNING = 1, END = -1 }

export class UI extends Observable<{ gameState: GameState, rightHanded?: boolean}>
{
    private _2Dmenu: AdvancedDynamicTexture;
    
    // menus
    public pauseMenu: Mesh;
    public DSpopup: Mesh;

    // discomfort score stuff
    private static readonly DSmin: number = 0;
    private static readonly DSmax: number = 10;
    private static readonly DSprompt: string = "discomfort score prompt etc";

    // font
    private static readonly fontSize: number = 36;
    private static readonly textScaleY: number = 1.3; // for scaling text in 3D; looks weird otherwise for some unknown reason

    constructor(name: string)
    {
        super();

        // create fullscreen UI for GUI elements
        this._2Dmenu = AdvancedDynamicTexture.CreateFullscreenUI(name);
        this._2Dmenu.idealHeight = 720;

    }

    public createMsg(message: string) : void
    {
       // display instructions
       const textBox: TextBlock = new TextBlock("Text Box");
       textBox.text = message;
       textBox.color = "black";
       textBox.fontSize = UI.fontSize;
       this._2Dmenu.addControl(textBox);
    }

    public createBtn(name: string) : Button
    {
        // create a button
        const btn: Button = Button.CreateSimpleButton(name + " button", name);
        btn.height = "120px";
        btn.color = "white";
        btn.width = 0.2;
        btn.top = "-14px";
        btn.thickness = 0;
        btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this._2Dmenu.addControl(btn);

        return btn;
    }

    public createPauseMenu(parent: Mesh) : void
    {
        const plane: Mesh = MeshBuilder.CreatePlane("Pause Menu", { width: 1, height: 0.5 });
        plane.position.set(parent.position.x, 0, parent.position.z + 1);
        plane.setParent(parent);
        plane.isVisible = false;
        this.pauseMenu = plane;

        const planeADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        // grid for organization
        const grid = new Grid("DS score slider grid");
        grid.background = "white";
        grid.alpha = 0.75;
        grid.width = 1;
        grid.height = 0.5;
        grid.addRowDefinition(20, true);      // extra column for padding b/c .padding doesn't seem to work
        grid.addRowDefinition(100, true);     // return to game button
        grid.addRowDefinition(20, true);      // extra column for padding b/c .padding doesn't seem to work
        grid.addRowDefinition(100, true);     // exit game button
        grid.addRowDefinition(20, true);      // extra column for padding b/c .padding doesn't seem to work

        // create return to game button
        const resumeBtn: Button = Button.CreateSimpleButton("resume button", "Resume");
        resumeBtn.widthInPixels = 400;
        resumeBtn.heightInPixels = 100;
        resumeBtn.background = "white";
        resumeBtn.scaleY = UI.textScaleY;
        resumeBtn.fontSize = UI.fontSize;
        resumeBtn.thickness = 0;    // border
        resumeBtn.textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        resumeBtn.onPointerDownObservable.add(() => {
            this.pauseMenu.isVisible = false;
            this.notifyObservers({ gameState: GameState.RUNNING });
        });

        // create exit button
        const exitBtn: Button = Button.CreateSimpleButton("exit button", "End Game");
        exitBtn.widthInPixels = 400;
        exitBtn.heightInPixels = 100;
        exitBtn.background = "white";
        exitBtn.scaleY = UI.textScaleY;
        exitBtn.fontSize = UI.fontSize;
        exitBtn.thickness = 0;    // border
        exitBtn.textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        exitBtn.onPointerDownObservable.add(() => {
            this.notifyObservers({ gameState: GameState.END });
            plane.dispose();
        });

        // attach controls
        planeADT.addControl(grid);
        grid.addControl(resumeBtn, 1, 0);
        grid.addControl(exitBtn, 3, 0);
    }

    public createDSPrompt(parent: Mesh) : void
    {
        const plane: Mesh = MeshBuilder.CreatePlane("DS Prompt", { width: 1.5, height: 1 });
        plane.position.set(parent.position.x, 0, parent.position.z + 0.5);
        plane.isVisible = false;
        this.DSpopup = plane;

        // do this so it shows up right in 3D. don't ask me why because I don't know. DON'T AT ME.
        const planeADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        // create prompt text
        const text: TextBlock = new TextBlock("DS score prompt");
        text.text = "Discomfort score prompt goes here more words and stuff to fill text block does this text wrap properly? What are the margins? Is the text squashed vertically? WHAT IS LIFE";
        text.textWrapping = true;
        text.widthInPixels = 750;
        text.heightInPixels = 450;
        text.scaleY = UI.textScaleY;  // text looks weird in 3D otherwise for some unknown reason
        text.fontSize = UI.fontSize;

        // load happy and sad faces
        let sadface: Image = new Image("sadface", "assets/textures/sadface.png");
        let happyface: Image = new Image("happyface", "assets/textures/happyface.png");

        // create slider
        const slider: Slider = new Slider();
        slider.minimum = UI.DSmin;
        slider.maximum = UI.DSmax;
        slider.value = UI.DSmax / 2;        // default value b/c slider starts in the middle
        let rating: number = slider.value;  // to store slider value
        slider.step = 1;
        slider.widthInPixels = 700;
        slider.heightInPixels = 50;
        
        // create header text to display slider value
        const sliderHeader: TextBlock = new TextBlock("DS score slider value");
        sliderHeader.heightInPixels = 75;
        sliderHeader.scaleY = UI.textScaleY;
        sliderHeader.text = slider.value.toString();
        sliderHeader.fontSize = UI.fontSize;
        sliderHeader.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        slider.onValueChangedObservable.add((value) => {
            sliderHeader.text = value.toString();
            rating = value;
        });

        // create submission button
        const submitBtn: Button = Button.CreateSimpleButton("submit button", "Submit");
        submitBtn.widthInPixels = 300;
        submitBtn.heightInPixels = 100;
        submitBtn.background = "white";
        submitBtn.scaleY = UI.textScaleY;
        submitBtn.fontSize = UI.fontSize;
        submitBtn.thickness = 0;    // border
        submitBtn.textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        submitBtn.onPointerDownObservable.add(() => {
            console.log("Discomfort score: " + rating);
            rating = 5;     // reset rating to 5 for next time
            plane.isVisible = false;
            this.notifyObservers({ gameState: GameState.RUNNING});
        });

        // grid for aligning happy/sad faces with slider
        const grid = new Grid("DS score slider grid");
        grid.background = "white";
        grid.alpha = 0.75;
        grid.widthInPixels = 890;
        grid.heightInPixels = 800;
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

        // add controls to grid from top to bottom, left to right
        planeADT.addControl(grid);
        grid.addControl(text, 1, 2);
        grid.addControl(sliderHeader, 2, 2);
        grid.addControl(sadface, 3, 1);
        grid.addControl(slider, 3, 2);
        grid.addControl(happyface, 3, 3);
        grid.addControl(submitBtn, 5, 2);
    }

    public getHandedness() : void
    {
        let rightHanded: boolean;

        const plane: Mesh = MeshBuilder.CreatePlane("Handedness prompt", { width: 1.5, height: 1 });
        plane.position.set(0, 1.6, 2);

        // do this so it shows up right in 3D. don't ask me why because I don't know. DON'T AT ME.
        const planeADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        // create stack panel for organizing things vertically
        // children MUST have height defined in pixels!!!!
        const stackPanel: StackPanel = new StackPanel("Handedness stack panel");

        // grid for radio buttons
        const grid = new Grid("Handedness grid");
        grid.widthInPixels = 800;
        grid.heightInPixels = 100;
        grid.addColumnDefinition(400, true);
        grid.addColumnDefinition(400, true);

        // create rectangle for white background
        const background: Rectangle = new Rectangle("Handedness background");
        background.background = "white";
        background.alpha = 0.75;
        background.heightInPixels = 500;
        background.width = 0.75;

        // create prompt text
        const text: TextBlock = new TextBlock("Handedness prompt");
        text.text = "Are you left- or right-handed?";
        text.textWrapping = true;
        text.widthInPixels = 500;
        text.heightInPixels = 200;
        text.scaleY = UI.textScaleY;  // text looks weird in 3D otherwise for some unknown reason
        text.fontSize = UI.fontSize;

        // create radio buttons
        const leftBtn = this._createRadioBtn("Left", "Handedness");
        const rightBtn = this._createRadioBtn("Right", "Handedness");
        const leftHeader = Control.AddHeader(leftBtn, "Left-handed", "150px", { isHorizontal: true, controlFirst: true });
        const rightHeader = Control.AddHeader(rightBtn, "Right-handed", "150px", { isHorizontal: true, controlFirst: true });
        leftBtn.onIsCheckedChangedObservable.add(() => {
            rightHanded = false;
        });
        rightBtn.onIsCheckedChangedObservable.add(() => {
            rightHanded = true;
        });

        // create submission button
        const submitBtn: Button = Button.CreateSimpleButton("submit button", "Submit");
        submitBtn.widthInPixels = 300;
        submitBtn.heightInPixels = 100;
        submitBtn.background = "white";
        submitBtn.scaleY = UI.textScaleY;
        submitBtn.fontSize = UI.fontSize;
        submitBtn.thickness = 0;    // border
        submitBtn.textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        submitBtn.onPointerDownObservable.add(() => {
            this.notifyObservers({ gameState: GameState.RUNNING, rightHanded: rightHanded });
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

    // private _createRadioBtn(text: string, group: string) : RadioButton
    // {
    //     const button: RadioButton = new RadioButton(text);
    //     button.group = group;
    //     button.widthInPixels = 20;
    //     button.heightInPixels = 20;
    //     button.color = "black";
    //     button.background = "white";

    //     const header = Control.AddHeader(button, text, "80px", { isHorizontal: true, controlFirst: true });
    //     header.heightInPixels = 50;

    //     return button;
    // }

    private _createRadioBtn(text: string, group: string) : RadioButton
    {
        const button: RadioButton = new RadioButton(text);
        button.group = group;
        button.widthInPixels = 30;
        button.heightInPixels = 30;
        button.color = "black";
        button.background = "white";

        return button;
    }
}