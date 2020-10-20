import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D";
import { Button, Control, Grid, Image, Slider, StackPanel, TextBlock } from "@babylonjs/gui/2D/controls";

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

        // used for organizing things vertically
        // children must have height defined in pixels!!!
        const stackPanel: StackPanel = new StackPanel();
        stackPanel.background = "white";
        stackPanel.alpha = 0.7;
        stackPanel.heightInPixels = 900;
        dsPlaneADT.addControl(stackPanel);

        // create prompt text
        const text: TextBlock = new TextBlock("DS score prompt");
        text.text = "Discomfort score prompt goes here more words and stuff to fill text block does this text wrap properly? What are the margins? Is the text squashed vertically? WHAT IS LIFE";
        text.textWrapping = true;
        text.widthInPixels = 750;
        text.heightInPixels = 400;
        text.scaleY = textScaleY;  // text looks weird in 3D otherwise for some unknown reason
        text.fontSize = fontSize;

        // grid for aligning happy/sad faces with slider
        const grid = new Grid("DS score slider grid");
        grid.widthInPixels = 800;
        grid.heightInPixels = 100;
        grid.addColumnDefinition(50, true);
        grid.addColumnDefinition(700, true);
        grid.addColumnDefinition(50, true);

        // load happy and sad faces
        let sadface: Image = new Image("sadface", "assets/textures/sadface.png");
        let happyface: Image = new Image("happyface", "assets/textures/happyface.png");
        // scale them so they're square. no, I do not, in fact, know why
        sadface.scaleY = 0.8;
        happyface.scaleY = 0.8;


        // spacer as a ugly workaround for stackpanel being a POS
        const spacer1 = new TextBlock("first spacer");
        spacer1.heightInPixels = 50;

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
        sliderHeader.heightInPixels = 150;
        sliderHeader.scaleY = textScaleY;
        sliderHeader.text = slider.value.toString();
        sliderHeader.fontSize = fontSize;

        slider.onValueChangedObservable.add(function(value) {
            sliderHeader.text = value.toString();
            rating = value;
        });

        // create spacer to insert between slider and submit button to prevent accidental submission
        const spacer: TextBlock = new TextBlock("DS score spacer");
        spacer.height = "75px";

        // create submission button
        const submitBtn: Button = Button.CreateSimpleButton("submit button", "Submit");
        submitBtn.widthInPixels = 300;
        submitBtn.heightInPixels = 80;
        submitBtn.background = "white";
        submitBtn.scaleY = textScaleY;
        submitBtn.fontSize = fontSize;
        submitBtn.thickness = 0;    // border
        submitBtn.textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        submitBtn.onPointerDownObservable.add(function(value) {
            console.log("Discomfort score: " + rating);
            dsPlane.isVisible = false;
        });

        // add controls to grid from left to right
        grid.addControl(sadface, 0, 0);
        grid.addControl(slider, 0, 1);
        grid.addControl(happyface, 0, 2);

        // add controls in the order you'd like to see it from top to bottom
        stackPanel.addControl(text);
        stackPanel.addControl(spacer1);
        stackPanel.addControl(sliderHeader);
        stackPanel.addControl(grid);
        stackPanel.addControl(spacer);
        stackPanel.addControl(submitBtn);

        return dsPlane;
    }


}