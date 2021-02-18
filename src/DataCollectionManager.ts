import { WebXRCamera, WebXRSessionManager } from "@babylonjs/core";

// custom classes
import * as RED from "./redapi_participant";
import { Trial } from "./Trial";

export class DataCollectionManager {
    private static readonly SERVER: string = "http://red.cse.umn.edu";
    // private static readonly EXP_ID: string = "Incidence of Cybersickness";
    private static readonly EXP_ID: string = "Christina-Testing";
    private _participantID: string;

    private _trial: Trial;
    private _xrCamera: WebXRCamera;
    private _xrSessionManager: WebXRSessionManager;

    constructor(xrCamera: WebXRCamera, xrSessionManager: WebXRSessionManager) {
        this._participantID = JSON.stringify(RED.register_participant(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID));
        console.log(this._participantID);

        this._xrCamera = xrCamera;
        this._xrSessionManager = xrSessionManager;
    }

    public registerNewTrial(trial: Trial) : void {
        this._trial = trial;
        this._trial.add( data => { this._logCoinPickup(data.timestamp) }, 1);
        console.log(this._participantID);
    }

    public logFrameInfo(timestamp: number, trialNumber: number, speed: number, state: number) : void {
        let physical: XRRigidTransform = this._xrSessionManager.currentFrame.getViewerPose(this._xrSessionManager.baseReferenceSpace).transform;

        RED.add_data(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID, this._participantID, "Frame", [{
            "Timestamp": String(timestamp),
            "Trial number": String(trialNumber),
            "Speed": String(speed),
            "State": (state == 1) ? "paused" : "running",
            // "State": String(state),   // change to string "paused"/"running" instead of number? 1 = paused, 2 = running

            "Virtual position x": String(this._xrCamera.globalPosition.x),
            "Virtual position y": String(this._xrCamera.globalPosition.y),
            "Virtual position z": String(this._xrCamera.globalPosition.z),

            "Virtual rotation x": String(this._xrCamera.absoluteRotation.x),
            "Virtual rotation y": String(this._xrCamera.absoluteRotation.y),
            "Virtual rotation z": String(this._xrCamera.absoluteRotation.z),
            "Virtual rotation w": String(this._xrCamera.absoluteRotation.w),

            "Physical position x": String(physical.position.x),
            "Physical position y": String(physical.position.y),
            "Physical position z": String(physical.position.z),

            "Physical rotation x": String(physical.orientation.x),
            "Physical rotation y": String(physical.orientation.y),
            "Physical rotation z": String(physical.orientation.z),
            "Physical rotation w": String(physical.orientation.w),
        }]);

//        console.log("Timestamp: " + timestamp + " " + 
//            "Trial number: " + " " + trialNumber + " " + 
//            "Speed:" + " " + speed + " " +
//            "V pos x: " + " " + this._xrCamera.globalPosition.x + " " +
//            "V rot x: " + " " + this._xrCamera.absoluteRotation.x + " " +
//            "P pos x: " + physical.position.x + " " +
//            "P rot x: " + physical.orientation.x + " " +
//            "State: " + (state == 1 ? "paused" : "running" )); 
    }

    public logTrialInfo(trialNumber: number, discomfortScore: number) : void {
        RED.add_data(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID, this._participantID, "Trial", [{
            "Trial number": String(trialNumber),
            "Discomfort score": String(discomfortScore),
            "Total coins": String(this._trial.totalCoinsInMaze),
            "Start time": String(this._trial.startTime),
            "End time": this._trial.endTime
        }]);

//        console.log("Trial number: " + " " + trialNumber + " " +
//            "Discomfort score:" + " " + discomfortScore + " " +
//            "Total coins: " + " " + this._trial.totalCoinsInMaze + " " +
//            "Start time: " + " " + this._trial.startTime + " " +
//            "End time: " + " " + this._trial.endTime); 
    }

    private _logCoinPickup(timestamp: number) : void {
        RED.add_data(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID, this._participantID, "Coin-pickups", [{ "Timestamp": String(timestamp) }]);
        
//        console.log("Timestamp of coin pickup: " + " " + timestamp);
    }
    public quitDataCollection() : void {
        RED.finish_participant(DataCollectionManager.SERVER, DataCollectionManager.EXP_ID, this._participantID);
    }
}