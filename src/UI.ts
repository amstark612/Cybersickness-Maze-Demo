import { AdvancedDynamicTexture } from "@babylonjs/gui/2D";
import { Button, Control, Grid, RadioButton, Rectangle, Slider, StackPanel, TextBlock } from "@babylonjs/gui/2D/controls";

// const TABLE_WIDTH: number = 800;
// const ROW_HEIGHT: number = 32;
// const COL_WIDTH: number  = 100;
// const FIRST_COL_WIDTH: number = TABLE_WIDTH - 4 * COL_WIDTH;

// const SSQ_QUESTIONS: Array<string> = [
//     "General discomfort",
//     "Fatigue",
//     "Headache",
//     "Eye strain",
//     "Difficulty focusing",
//     "Increased salivation",
//     "Sweating",
//     "Nausea",
//     "Difficulty concentrating",
//     "Fullness of head",
//     "Blurred vision",
//     "Dizzy (eyes open)",
//     "Dizzy (eyes closed)",
//     "Vertigo",
//     "Stomach awareness",
//     "Burping"
// ];

// enum Rating { NONE = 0, SLIGHT = 1, MODERATE = 2, SEVERE = 3 }
// const SSQ_RATINGS: Array<string> = [
//     "None",
//     "Slight",
//     "Moderate",
//     "Severe"
// ]

export class UI
{
    public menu: AdvancedDynamicTexture;
    // private _cybersickAnswer: boolean | null;       // user answer  to "Are you motion sick right now?"
    // private _SSQanswers: Array<number> = [];        // parallel array for user answer to each SSQ

    private static readonly TABLE_WIDTH: number = 100;
    private static readonly ROW_HEIGHT: number = 32;
    private static readonly COL_WIDTH: number = 100;
    private static readonly FIRST_COL_WIDTH = UI.TABLE_WIDTH - 4 * UI.COL_WIDTH;

    // private static readonly SSQ_QUESTIONS: Array<string> = [
    //     "General discomfort",
    //     "Fatigue",
    //     "Headache",
    //     "Eye strain",
    //     "Difficulty focusing",
    //     "Increased salivation",
    //     "Sweating",
    //     "Nausea",
    //     "Difficulty concentrating",
    //     "Fullness of head",
    //     "Blurred vision",
    //     "Dizzy (eyes open)",
    //     "Dizzy (eyes closed)",
    //     "Vertigo",
    //     "Stomach awareness",
    //     "Burping"
    // ];

    // private static readonly SSQ_RATINGS: Array<string> = [
    //     "None",
    //     "Slight",
    //     "Moderate",
    //     "Severe"
    // ];

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

    // public createSSQ() : void
    // {
    //     // create container
    //     const panel = new StackPanel();
    //     panel.fontSizeInPixels = 18;
    //     this.menu.addControl(panel);

    //     // create 3 grids, all with different # of cols
    //     // 1 for "Are you motion sick right now?"
    //     // 1 for instructions
    //     // 1 for SSQ questions
    //     // heights MUST be defined in pixels to work in stackpanel
    //     const cybersickGrid = new Grid();
    //     cybersickGrid.background = "white";
    //     cybersickGrid.alpha = 0.7;
    //     cybersickGrid.widthInPixels = UI.TABLE_WIDTH;
    //     cybersickGrid.heightInPixels = UI.ROW_HEIGHT;
    //     panel.addControl(cybersickGrid);

    //     const instructionsGrid = new Grid();
    //     instructionsGrid.background = "white";
    //     instructionsGrid.alpha = 0.9;
    //     instructionsGrid.widthInPixels = UI.TABLE_WIDTH;
    //     instructionsGrid.heightInPixels = UI.ROW_HEIGHT;
    //     panel.addControl(instructionsGrid);

    //     const SSQGrid = new Grid();
    //     SSQGrid.background = "white";
    //     SSQGrid.alpha = 0.7;
    //     SSQGrid.widthInPixels = UI.TABLE_WIDTH;
    //     SSQGrid.heightInPixels = UI.SSQ_QUESTIONS.length * UI.ROW_HEIGHT;
    //     panel.addControl(SSQGrid);

    //     // create rows and columns
    //     // 3 cols for "Are you motion sick right now?"
    //     cybersickGrid.addColumnDefinition(UI.FIRST_COL_WIDTH, true);
    //     cybersickGrid.addColumnDefinition(UI.COL_WIDTH, true);
    //     cybersickGrid.addColumnDefinition(UI.COL_WIDTH, true);

    //     // 16 rows & 5 cols for SSQ questions
    //     SSQGrid.addColumnDefinition(UI.FIRST_COL_WIDTH, true);
    //     for (let col = 1; col < 5; col++)
    //     {
    //         SSQGrid.addColumnDefinition(UI.COL_WIDTH, true);
    //     }
    //     for (let row = 0; row < 16; row++)
    //     {
    //         SSQGrid.addRowDefinition(UI.ROW_HEIGHT, true);           
    //     }

    //     // color every other row for readability
    //     for (let row = 1; row < 16; row += 2)
    //     {
    //         for (let col = 0; col < 5; col++)
    //         {
    //             let rect = new Rectangle();
    //             rect.background = "white";
    //             rect.alpha = 0.8;
    //             SSQGrid.addControl(rect, row, col);
    //         }
    //     }

    //     // fill grid with prompts/questions
    //     const q1 = "Are you motion sick right now?";
    //     const q1Box = this.createSSQTextbox(q1);

    //     let yes = this.createRadioButton(q1);
    //     yes.onIsCheckedChangedObservable.add(function(state)
    //     {
    //         if (state)
    //         {
    //             this._cybersickAnswer = true;
    //             console.log(this._cybersickAnswer);
    //         }
    //     });
    //     let y = this.createButtonHeader(yes, "Yes");

    //     let no = this.createRadioButton(q1);
    //     yes.onIsCheckedChangedObservable.add(function(state)
    //     {
    //         if (state)
    //         {
    //             this._cybersickAnswer = false;
    //         }
    //     });
    //     let n = this.createButtonHeader(no, "No");

    //     cybersickGrid.addControl(q1Box, 0, 0);
    //     cybersickGrid.addControl(y, 0, 1);
    //     cybersickGrid.addControl(n, 0, 2);

    //     const instrBox = this.createSSQTextbox("Please select how much each of the following symptoms is affecting you right now:");
    //     instrBox.paddingLeftInPixels = 25;
    //     instructionsGrid.addControl(instrBox, 0, 0);

    //     // SSQ questions
    //     for (let row = 0; row < 16; row++)
    //     {
    //         // prompts
    //         let question = this.createSSQTextbox(UI.SSQ_QUESTIONS[row]);
    //         SSQGrid.addControl(question, row, 0);

    //         // radio buttons
    //         let group = UI.SSQ_QUESTIONS[row];
    //         for (let col = 1; col < 5; col++)
    //         {
    //             let button = this.createRadioButton(group);
    //             button.onIsCheckedChangedObservable.add(function(state)
    //             {
    //                 if (state)
    //                 {
    //                     console.log(group + " " + (col - 1));
    //                     this._SSQanswers[row] = col - 1;
    //                 }
    //             });

    //             let selection = this.createButtonHeader(button, UI.SSQ_RATINGS[col - 1]);
    //             SSQGrid.addControl(selection, row, col);
    //         }
    //     }
    // }

    // private createSSQTextbox(question: string) : TextBlock
    // {
    //     const textbox = new TextBlock();
    //     textbox.text = question;

    //     textbox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    //     textbox.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

    //     textbox.paddingLeftInPixels = 40;

    //     textbox.widthInPixels = UI.FIRST_COL_WIDTH;
    //     textbox.heightInPixels = UI.ROW_HEIGHT;
    //     textbox.color = "black";

    //     return textbox;
    // }

    // private createRadioButton(group: string) : RadioButton
    // {
    //     let btn = new RadioButton();

    //     btn.group = group;
        
    //     btn.width = "10px";
    //     btn.height = "10px";

    //     btn.color = "black";
    //     btn.background = "gray";

    //     return btn;
    // }

    // private createButtonHeader(btn: RadioButton, text: string) : Control
    // {
    //     let header = Control.AddHeader(btn, text, "80px", { isHorizontal: true, controlFirst: true});
    //     header.heightInPixels = UI.ROW_HEIGHT;

    //     return header;
    // }

    // public submitSSQ() : void
    // {
    //     // for (let question = 0; question < this._SSQanswers.length; question++)
    //     // {
    //     //     console.log(this._SSQanswers);
    //     // }
    //     console.log(this._cybersickAnswer + " from submitSSQ");
    // }
}