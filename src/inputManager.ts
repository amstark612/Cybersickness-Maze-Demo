import { Observable, Scene } from "@babylonjs/core";
import { WebXRControllerComponent, WebXRInputSource } from "@babylonjs/core/XR";

export class InputManager extends Observable<WebXRControllerComponent>
{
    private _leftController: WebXRInputSource | null;
    private _rightController: WebXRInputSource | null;
    private _primaryController: WebXRInputSource;

    constructor(scene: Scene, leftController: WebXRInputSource, rightController: WebXRInputSource)
    {
        super();

        this._leftController = leftController;
        this._rightController = rightController;
    }

    public setPrimaryController(rightHanded: boolean) : void
    {
        this._primaryController = rightHanded ? this._rightController : this._leftController;
    }

    public updateControllerInput() : void
    {
        this._onLeftTrigger(this._leftController?.motionController?.getComponent("xr-standard-trigger"));
        this._onRightTrigger(this._rightController?.motionController?.getComponent("xr-standard-trigger"));
        this._onLeftX(this._leftController?.motionController?.getComponent("x-button"));
        this._onRightA(this._rightController?.motionController?.getComponent("a-button"));
        this._onPrimaryThumbstick(this._primaryController?.motionController?.getComponent("xr-standard-thumbstick"));
    }

    private _onLeftTrigger(component?: WebXRControllerComponent) : void
    {

    }

    private _onRightTrigger(component?: WebXRControllerComponent) : void
    {

    }

    private _onPrimaryThumbstick(component?: WebXRControllerComponent) : void
    {
        if (component?.axes.y)
        {
            this.notifyObservers(component);
        }
    }

    private _onLeftX(component? : WebXRControllerComponent) : void
    {
        if (component?.changes.pressed)
        {
            this.notifyObservers(component);
        }
    }

    private _onRightA(component?: WebXRControllerComponent) : void
    {  
        if (component?.changes.pressed)
        {
            this.notifyObservers(component);
        }
    }
}