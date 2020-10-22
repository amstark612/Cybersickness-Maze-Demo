import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D";
import { Button, Control, Grid, Image, Slider, TextBlock } from "@babylonjs/gui/2D/controls";

export class UI
{
    private _menu: AdvancedDynamicTexture;

    private static readonly DSmin: number = 0;
    private static readonly DSmax: number = 10;

    constructor(name: string)
    {
        // create fullscreen UI for GUI elements
        this._menu = AdvancedDynamicTexture.CreateFullscreenUI(name);
        this._menu.idealHeight = 720;
    }

    private _getMenu() : AdvancedDynamicTexture
    {
        return this._menu;
    }

    public createMsg(message: string) : void
    {
       // display instructions
       const textBox: TextBlock = new TextBlock("Text Box");
       textBox.text = message;
       textBox.color = "black";
       textBox.fontSize = 48;
       this._menu.addControl(textBox);
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
        this._menu.addControl(btn);

        return btn;
    }

    public createDSPrompt(scene: Scene) : Mesh
    {
        const fontSize: number = 40;
        const textScaleY: number = 1.3; // must scale text in 3D; looks weird otherwise for some unknown reason

        const dsPlane: Mesh = MeshBuilder.CreatePlane("dsPrompt", { width: 1.5, height: 1 }, scene);
        dsPlane.isVisible = false;

        // do this so it shows up right in 3D. don't ask me why because I don't know. DON'T AT ME.
        const dsPlaneADT: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateForMesh(dsPlane);

        // create prompt text
        const text: TextBlock = new TextBlock("DS score prompt");
        text.text = "Discomfort score prompt goes here more words and stuff to fill text block does this text wrap properly? What are the margins? Is the text squashed vertically? WHAT IS LIFE";
        text.textWrapping = true;
        text.widthInPixels = 750;
        text.heightInPixels = 450;
        text.scaleY = textScaleY;  // text looks weird in 3D otherwise for some unknown reason
        text.fontSize = fontSize;

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
        sliderHeader.scaleY = textScaleY;
        sliderHeader.text = slider.value.toString();
        sliderHeader.fontSize = fontSize;
        sliderHeader.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        slider.onValueChangedObservable.add(function(value) {
            sliderHeader.text = value.toString();
            rating = value;
        });

        // create submission button
        const submitBtn: Button = Button.CreateSimpleButton("submit button", "Submit");
        submitBtn.widthInPixels = 300;
        submitBtn.heightInPixels = 100;
        submitBtn.background = "white";
        submitBtn.scaleY = textScaleY;
        submitBtn.fontSize = fontSize;
        submitBtn.thickness = 0;    // border
        submitBtn.textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        submitBtn.onPointerDownObservable.add(function(value) {
            console.log("Discomfort score: " + rating);
            dsPlane.isVisible = false;
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

        return dsPlane;
    }


}