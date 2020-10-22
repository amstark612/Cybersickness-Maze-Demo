import { ActionManager, Logger, Scene } from "@babylonjs/core";
import { WebXRControllerComponent, WebXRInputSource } from "@babylonjs/core/XR";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math";

export class InputManager
{

    private _leftController: WebXRInputSource | null;
    private _rightController: WebXRInputSource | null;
    private _primaryController: WebXRInputSource | null;

    public gamePaused: boolean = false;
    public z: number = 0;           // thumbstick up/down value for z-axis movement

    constructor(scene: Scene, leftController: WebXRInputSource, rightController: WebXRInputSource)
    {
        // scene.actionManager = new ActionManager(scene);
        this._leftController = leftController;
        this._rightController = rightController;

        // DON'T FORGET TO CHANGE ME PLEASE
        this.setPrimaryController(this._rightController);
    }

    public setPrimaryController(controller: WebXRInputSource) : void
    {
        // this._primaryController = controller;
        this._primaryController = this._rightController;
    }

    public processControllerInput() : void
    {
        this._onLeftTrigger(this._leftController?.motionController?.getComponent("xr-standard-trigger"));
        this._onRightTrigger(this._rightController?.motionController?.getComponent("xr-standard-trigger"));
        this._onRightA(this._rightController?.motionController?.getComponent("a-button"));

        this.z = this._onPrimaryThumbstick(this._primaryController?.motionController?.getComponent("xr-standard-thumbstick"));
    }

    private _onLeftTrigger(component?: WebXRControllerComponent) : void
    {

    }

    private _onRightTrigger(component?: WebXRControllerComponent) : void
    {
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                console.log("right squeeze pressed");
            }
            else
            {
                console.log("right squeeze released");
            }
        }  
    }

    private _onPrimaryThumbstick(component?: WebXRControllerComponent) : number
    {
        return component?.axes.y;
    }

    private _onRightA(component?: WebXRControllerComponent)
    {  
            if(component?.pressed)
            {
                console.log("right A pressed");
            } 
    }
}