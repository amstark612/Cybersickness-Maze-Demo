import { ActionManager, Logger, Scene } from "@babylonjs/core";
import { WebXRControllerComponent, WebXRInputSource } from "@babylonjs/core/XR";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math";

export class InputManager
{

    private _leftController: WebXRInputSource | null;
    private _rightController: WebXRInputSource | null;
    private _primaryController: WebXRInputSource;

    public z: number = 0;               // thumbstick up/down value for z-axis movement
    public callMenu: boolean = false;   // for in-game menu

    constructor(scene: Scene, leftController: WebXRInputSource, rightController: WebXRInputSource)
    {
        this._leftController = leftController;
        this._rightController = rightController;
    }

    public setPrimaryController(handedness: boolean) : void
    {
        // handedness: false for left, true for right
        this._primaryController = handedness ? this._rightController : this._leftController;
    }

    public processControllerInput() : void
    {
        this._onLeftTrigger(this._leftController?.motionController?.getComponent("xr-standard-trigger"));
        this._onRightTrigger(this._rightController?.motionController?.getComponent("xr-standard-trigger"));
        this._onLeftX(this._leftController?.motionController?.getComponent("x-button"));
        this._onRightA(this._rightController?.motionController?.getComponent("a-button"));

        this.z = this._onPrimaryThumbstick(this._primaryController?.motionController?.getComponent("xr-standard-thumbstick"));
    }

    private _onLeftTrigger(component?: WebXRControllerComponent) : void
    {

    }

    private _onRightTrigger(component?: WebXRControllerComponent) : void
    {
        // if(component?.changes.pressed)
        // {
        //     if(component?.pressed)
        //     {
        //         console.log("right squeeze pressed");
        //     }
        //     else
        //     {
        //         console.log("right squeeze released");
        //     }
        // }  
    }

    private _onPrimaryThumbstick(component?: WebXRControllerComponent) : number
    {
        return component?.axes.y;
    }

    private _onLeftX(component? : WebXRControllerComponent) : void
    {
        if (component?.pressed)
        {
            this.callMenu = !this.callMenu ? true : false;
        }
    }

    private _onRightA(component?: WebXRControllerComponent) : void
    {  
        if (component?.hasChanges && component?.pressed)
        {
            this.callMenu = true;          
        }

        // if(component?.pressed)
        // {
        //     this.callMenu = !this.callMenu ? true : false;
        //     console.log("pressed a");
        //     console.log(this.callMenu);
        // } 
    }
}