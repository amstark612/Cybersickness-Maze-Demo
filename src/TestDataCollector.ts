import { WebXRCamera, WebXRSessionManager } from "@babylonjs/core";

// custom classes
import { IDataCollector } from "./IDataCollector";
import { Trial } from "./Trial";

export class TestDataCollector implements IDataCollector {
  private _dataCollector: IDataCollector;

  private _trial: Trial;
  private _xrCamera: WebXRCamera;
  private _xrSessionManager: WebXRSessionManager;

  constructor(xrCamera: WebXRCamera, xrSessionManager: WebXRSessionManager, dataCollector: IDataCollector) {
      this._dataCollector = dataCollector;  
      this._xrCamera = xrCamera;
      this._xrSessionManager = xrSessionManager;
  }

  public registerNewTrial(trial: Trial) : void {
      console.log("Registering trial " + trial);
      this._dataCollector.registerNewTrial(trial);
  }
  
  public logFrameInfo(timestamp: number, trialNumber: number, speed: number, state: number) : void {
        let physical: XRRigidTransform = this._xrSessionManager.currentFrame.getViewerPose(this._xrSessionManager.baseReferenceSpace).transform;

      console.log("Timestamp: " + timestamp + " " + 
          "Trial number: " + " " + trialNumber + " " + 
          "Speed:" + " " + speed + " " +
          "V pos x: " + " " + this._xrCamera.globalPosition.x + " " +
          "V rot x: " + " " + this._xrCamera.absoluteRotation.x + " " +
          "P pos x: " + physical.position.x + " " +
          "P rot x: " + physical.orientation.x + " " +
          "State: " + (state == 1 ? "paused" : "running" )); 

      this._dataCollector.logFrameInfo(timestamp, trialNumber, speed, state);
  }
  
  public logTrialInfo(trialNumber: number, discomfortScore: number) : void {
      console.log("Trial number: " + " " + trialNumber + " " +
          "Discomfort score:" + " " + discomfortScore + " " +
          "Total coins: " + " " + this._trial.totalCoinsInMaze + " " +
          "Start time: " + " " + this._trial.startTime + " " +
          "End time: " + " " + this._trial.endTime); 

      this._dataCollector.logTrialInfo(trialNumber, discomfortScore);
  }

  public logCoinPickup(timestamp: number) : void {
      console.log("Timestamp of coin pickup: " + " " + timestamp);
      this._dataCollector.logCoinPickup(timestamp);
  }

  public quitDataCollection() : void {
      console.log("Quitting data collection");
      this._dataCollector.quitDataCollection();
  }
}
