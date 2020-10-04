import { AdvancedDynamicTexture } from "@babylonjs/gui/2D";
import { Button, Control, Grid, RadioButton, Rectangle, Slider, StackPanel, TextBlock } from "@babylonjs/gui/2D/controls";

export class UI
{
    public menu: AdvancedDynamicTexture;
    private _SSQquestions = [
        "Are you motion sick right now?",
        "General discomfort",
        "Fatigue",
        "Headache",
        "Eye strain",
        "Difficulty focusing",
        "Increased salivation",
        "Sweating",
        "Nausea",
        "Difficulty concentrating",
        "Fullness of head",
        "Blurred vision",
        "Dizzy (eyes open)",
        "Dizzy (eyes closed)",
        "Vertigo",
        "Stomach awareness",
        "Burping"
    ];

    private _SSQratings = [
        "None",
        "Slight",
        "Moderate",
        "Severe"
    ]

    constructor(name: string)
    {
        // create fullscreen UI for GUI elements
        this.menu = AdvancedDynamicTexture.CreateFullscreenUI(name);
        this.menu.idealHeight = 720;
    }

    public createMsg(message: string) : void
    {
       // display instructions
       const textBox = new TextBlock("Text Box");
       textBox.text = message;
       textBox.color = "black";
       textBox.fontSize = 48;
       this.menu.addControl(textBox);
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
        this.menu.addControl(btn);

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
        this.menu.addControl(container);
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

    public createSSQ() : void
    {
        const grid = new Grid();
        grid.background = "white";
        grid.alpha = 0.7;
        grid.width = "800px";
        this.menu.addControl(grid);

        // create rows and columns
        grid.addColumnDefinition(400, true);    // question
        // for radio buttons
        for (let col = 0; col < 4; col++)
        {
            grid.addColumnDefinition(100, true);
            grid.addColumnDefinition(100, true);
            grid.addColumnDefinition(100, true);
            grid.addColumnDefinition(100, true);
        }
        // yes/no cybersick question, blank row,
        // instructions, plus 16 SSQ questions
        for (let row = 0; row < 18; row++)
        {
            grid.addRowDefinition(35, true);
        }

        // color every other row in questionnaire
        for (let row = 1; row < 18; row += 2)
        {
            for (let col = 0; col < 5; col++)
            {
                let rect = new Rectangle();
                rect.background = "white";
                grid.addControl(rect, row, col);
            }
        }

        const cybersick = this.createSSQTextbox(this._SSQquestions[0]);
        let yes = this.createRadioButton("Yes", this._SSQquestions[0]);
        let no = this.createRadioButton("No", this._SSQquestions[0]);
        grid.addControl(cybersick, 0, 0);
        grid.addControl(yes, 0, 1);
        grid.addControl(no, 0, 2);

        const instructions = this.createSSQTextbox("Select how much each of the following symptoms is affecting you right now.");
        instructions.paddingLeftInPixels = 25;
        grid.addControl(instructions, 1, 0);

        // SSQ questions
        for (let row = 2; row < 18; row++)
        {
            // prompts
            let question = this.createSSQTextbox(this._SSQquestions[row - 1]);
            grid.addControl(question, row, 0);

            // radio buttons
            let group = this._SSQquestions[row - 1];
            for (let col = 1; col <5; col++)
            {
                // let selection = this.createRadioButton(this._SSQratings[col - 1]);
                let selection = this.createRadioButton(this._SSQratings[col - 1], group);
                grid.addControl(selection, row, col);
            }
        }

        // SSQ radio buttons
        for (let row = 3; row < 17; row++)
        {

        }
    }

    private createSSQTextbox(question: string) : TextBlock
    {
        const textbox = new TextBlock();
        textbox.text = question;

        textbox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        textbox.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

        textbox.paddingLeftInPixels = 50;
        // textbox.paddingTopInPixels= 25;

        textbox.widthInPixels = 400;
        textbox.heightInPixels = 100;
        textbox.color = "black";
        textbox.fontSizeInPixels = 18;

        return textbox;
    }

    private createRadioButton(text: string, group: string) : Control
    {
        let btn = new RadioButton();

        btn.group = group;
        
        btn.width = "10px";
        btn.height = "10px";

        btn.color = "black";
        btn.background = "gray";

        let header = Control.AddHeader(btn, text, "75px", { isHorizontal: true, controlFirst: true });
        header.heightInPixels = 100;

        return header;
    }
}