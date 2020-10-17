import { AdvancedDynamicTexture } from "@babylonjs/gui/2D";
import { Button, Control, Grid, RadioButton, Rectangle, Slider, StackPanel, TextBlock } from "@babylonjs/gui/2D/controls";

export class UI
{
    private _menu: AdvancedDynamicTexture;

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
       const textBox = new TextBlock("Text Box");
       textBox.text = message;
       textBox.color = "black";
       textBox.fontSize = 48;
       this._menu.addControl(textBox);
    }

    public createBtn(name: string) : Button
    {
        // create a button
        const btn = Button.CreateSimpleButton(name + " button", name);
        btn.height = "120px";
        btn.color = "white";
        btn.width = 0.2;
        btn.top = "-14px";
        btn.thickness = 0;
        btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this._menu.addControl(btn);

        return btn;
    }

    public createDSPrompt() : Rectangle
    {
        // create container
        const container = new Rectangle();
        container.width = 0.8;
        container.height = "300px";
        container.cornerRadius = 20;
        container.background = "white";
        container.alpha = 0.7;
        this._menu.addControl(container);
        container.isVisible = false;

        const panel = new StackPanel();
        container.addControl(panel);

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
        let rating: number = 5;
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
            console.log("Discomfort score: " + rating);
            container.isVisible = false;
        });

        return container;
    }
}