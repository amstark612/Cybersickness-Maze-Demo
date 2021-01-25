import { WebXRCamera, WebXRSessionManager } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths";

// custom classes
import * as RED from "./redapi_participant";
import { Trial } from "./Trial";
import { TrialInfo } from "./TrialInfo";

export class DataCollectionManager {
    private static readonly SERVER: string = "http://red.cse.umn.edu";
    // private static readonly EXP_ID: string = "Incidence of Cybersickness";
    private static readonly EXP_ID: string = "Christina Testing";
    private _participantID: string;

    private _trialInfo: TrialInfo;
    private _xrCamera: WebXRCamera;
    private _xrSessionManager: WebXRSessionManager;

    constructor(xrCamera: WebXRCamera, xrSessionManager: WebXRSessionManager) {
        // this._participantID = JSON.stringify(RED.register_participant(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID));
        this._xrCamera = xrCamera;
        this._xrSessionManager = xrSessionManager;
    }

    public registerNewTrial(trial: Trial) : void {
        trial.add(trialInput => { this._trialInfo = trialInput });
    }

//    public logBaselineInfo(time: number) : void {
//        let physical: XRRigidTransform = this._xrSessionManager.currentFrame.getViewerPose(this._xrSessionManager.baseReferenceSpace).transform;
//
//        RED.add_data(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID, this._participantID, "Baseline", [{
//            "Timestamp": String(time),
//
//            "Virtual position x": this._xrCamera.globalPosition.x,
//            "Virtual position y": this._xrCamera.globalPosition.y,
//            "Virtual position z": this._xrCamera.globalPosition.z,
//
//            "Virtual rotation x": this._xrCamera.absoluteRotation.x,
//            "Virtual rotation y": this._xrCamera.absoluteRotation.y,
//            "Virtual rotation z": this._xrCamera.absoluteRotation.z,
//            "Virtual rotation w": this._xrCamera.absoluteRotation.w,
//
//            "Physical position x": physical.position.x,
//            "Physical position y": physical.position.y,
//            "Physical position z": physical.position.z,
//
//            "Physical rotation x": physical.orientation.x,
//            "Physical rotation y": physical.orientation.y,
//            "Physical rotation z": physical.orientation.z,
//            "Physical rotation w": physical.orientation.w
//        }]);
//    }

    public logFrameInfo(time: number, trialNumber: number, speed: number) : void {
        let physical: XRRigidTransform = this._xrSessionManager.currentFrame?.getViewerPose(this._xrSessionManager.baseReferenceSpace)?.transform;

//        RED.add_data(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID, this._participantID, "Frame", [{
//            "Timestamp": String(time),
//            "Trial number": String(trialNumber),
//            "Speed": String(speed),
//
//            "Virtual position x": this._xrCamera.globalPosition.x,
//            "Virtual position y": this._xrCamera.globalPosition.y,
//            "Virtual position z": this._xrCamera.globalPosition.z,
//
//            "Virtual rotation x": this._xrCamera.absoluteRotation.x,
//            "Virtual rotation y": this._xrCamera.absoluteRotation.y,
//            "Virtual rotation z": this._xrCamera.absoluteRotation.z,
//            "Virtual rotation w": this._xrCamera.absoluteRotation.w,
//
//            "Physical position x": physical.position.x,
//            "Physical position y": physical.position.y,
//            "Physical position z": physical.position.z,
//
//            "Physical rotation x": physical.orientation.x,
//            "Physical rotation y": physical.orientation.y,
//            "Physical rotation z": physical.orientation.z,
//            "Physical rotation w": physical.orientation.w
//        }]);

        console.log("Timestamp: " + time + " " + "Trial number: " + " " + trialNumber + " " + 
            "Speed:" + " " + speed + " " +
            "V pos x: " + " " + this._xrCamera.globalPosition.x + " " +
            "V rot x: " + " " + this._xrCamera.absoluteRotation.x +
            "P pos x: " + physical.position.x +
            "P rot x: " + physical.orientation.x); 
    }

    public logTrialInfo(trialNumber: number, discomfortScore: number) : void {
//        RED.add_data(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID, this._participantID, "Trial", [{
//            "Trial number": String(trialNumber),
//            "Discomfort score": String(discomfortScore),
//            "Coins collected": String(this._trialInfo.coinsCollected),
//            "Start time": String(this._trialInfo.startTime),
//            "End time": this._trialInfo.endTime
//        }]);
        console.log("Trial number: " + " " + trialNumber + " " +
            "Discomfort score:" + " " + discomfortScore + " " +
            "Coins collected: " + " " + this._trialInfo.coinsCollected + " " +
            "Start time: " + " " + this._trialInfo.startTime + " " +
            "End time: " + " " + this._trialInfo.endTime); 
    }

    public quitDataCollection() : void {
        RED.finish_participant(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID, this._participantID);
    }
}