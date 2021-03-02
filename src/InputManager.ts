import { Observable } from "@babylonjs/core";
import { WebXRControllerComponent, WebXRInputSource } from "@babylonjs/core/XR";

export class InputManager extends Observable<WebXRControllerComponent> {
    private _leftController: WebXRInputSource | null;
    private _rightController: WebXRInputSource | null;
    private _primaryController: WebXRInputSource;

    constructor(leftController: WebXRInputSource, rightController: WebXRInputSource) {
        super();

        this._leftController = leftController;
        this._rightController = rightController;
    }

    public setPrimaryController(rightHanded: boolean) : void {
        this._primaryController = rightHanded ? this._rightController : this._leftController;
    }

    public updateControllerInput() : void {
        this._onLeftTrigger(this._leftController?.motionController?.getComponent("xr-standard-trigger"));
        this._onRightTrigger(this._rightController?.motionController?.getComponent("xr-standard-trigger"));
        this._onLeftX(this._leftController?.motionController?.getComponent("x-button"));
        this._onRightA(this._rightController?.motionController?.getComponent("a-button"));
        // this._onRightB(this._rightController?.motionController?.getComponent("b-button"));
        this._onPrimaryThumbstick(this._primaryController?.motionController?.getComponent("xr-standard-thumbstick"));
    }

    private _onLeftTrigger(component?: WebXRControllerComponent) : void {

    }

    private _onRightTrigger(component?: WebXRControllerComponent) : void {

    }

    private _onPrimaryThumbstick(component?: WebXRControllerComponent) : void {
        if (component!) {  // so that player controller will update speed to 0 for data collection
//        if (component?.axes.y || component?.axes.y == 0) {  // so that player controller will update speed to 0 for data collection
            this.notifyObservers(component);
        }
    }

    private _onLeftX(component? : WebXRControllerComponent) : void {
        if (component?.changes.pressed) {
            this.notifyObservers(component);
        }
    }

    private _onRightA(component?: WebXRControllerComponent) : void {  
        if (component?.changes.pressed) {
            this.notifyObservers(component);
        }
    }

    private _onRightB(component?: WebXRControllerComponent) : void {
        // if (component?.changes.pressed) {
        //     this.notifyObservers(component);
        // }
    }
}
