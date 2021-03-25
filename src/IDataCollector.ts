import { Trial } from "./Trial";

export interface IDataCollector {
    registerNewTrial(trial: Trial) : void;
    logFrameInfo(timestamp: number, trialNumber: number, speed: number, state: number) : void;
    logTrialInfo(trialNumber: number, discomfortScore: number) : void;
    logCoinPickup(timestamp: number) : void;
    quitDataCollection() : void;
}
