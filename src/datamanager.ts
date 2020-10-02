import { Scene } from "@babylonjs/core";
import { Button, Rectangle, Control, TextBlock, Slider, StackPanel } from "@babylonjs/gui/2D/controls";

export class DataManager
{
    private _scene: Scene;

    constructor(scene: Scene)
    {
        this._scene = scene;
    }

    private createDSPrompt() : void
    {
        // create container
        const rect1 = new Rectangle();
        rect1.width = 0.8;
        rect1.height = "300px";
        rect1.cornerRadius = 20;
        rect1.background = "white";
        rect1.alpha = 0.7;
        // playerUI.addControl(rect1);
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
    }
}