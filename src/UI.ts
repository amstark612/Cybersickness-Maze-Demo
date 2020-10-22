import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D";
import { Button, Control, Grid, Image, RadioButton, Rectangle, Slider, StackPanel, TextBlock } from "@babylonjs/gui/2D/controls";

export class UI
{
    private _2Dmenu: AdvancedDynamicTexture;
    public gamePaused: boolean = false;

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

    public createDSPrompt(scene: Scene) : void
    {
        const dsPlane: Mesh = MeshBuilder.CreatePlane("DS Prompt", { width: 1.5, height: 1 }, scene);
        dsPlane.isVisible = false;
        this.DSpopup = dsPlane;

        // do this so it shows up right in 3D. don't ask me why because I don't know. DON'T AT ME.
        const dsPlaneADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(dsPlane);

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
            dsPlane.isVisible = false;
            this.gamePaused = false;
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
        dsPlaneADT.addControl(grid);
        grid.addControl(text, 1, 2);
        grid.addControl(sliderHeader, 2, 2);
        grid.addControl(sadface, 3, 1);
        grid.addControl(slider, 3, 2);
        grid.addControl(happyface, 3, 3);
        grid.addControl(submitBtn, 5, 2);
    }

    public createHandednessPrompt(scene: Scene) : Mesh
    {
        let rightHanded: boolean = true;

        const plane: Mesh = MeshBuilder.CreatePlane("Handedness prompt", { width: 0.75, height: 0.75 }, scene);

        // do this so it shows up right in 3D. don't ask me why because I don't know. DON'T AT ME.
        const planeADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        // create stack panel for organizing things vertically
        // children MUST have height defined in pixels!!!!
        const stackPanel: StackPanel = new StackPanel("Handedness stack panel");

        // grid for radio buttons
        const grid = new Grid("Handedness grid");
        grid.widthInPixels = 700;
        grid.heightInPixels = 100;
        grid.addColumnDefinition(350, true);
        grid.addColumnDefinition(350, true);

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

        // how to pass this back to main...?
        submitBtn.onPointerDownObservable.add(() => {
            plane.isVisible = false;
            return rightHanded;
        });

        // attach controls
        planeADT.addControl(background);
        planeADT.addControl(stackPanel);
        stackPanel.addControl(text);
        stackPanel.addControl(grid);
        grid.addControl(leftHeader, 0, 0);
        grid.addControl(rightHeader, 0, 1);
        stackPanel.addControl(submitBtn);

        return plane;
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