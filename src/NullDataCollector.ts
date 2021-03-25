import { IDataCollector } from "./IDataCollector";
import { Trial } from "./Trial";

export class NullDataCollector implements IDataCollector {
    readonly SERVER: string;
    readonly EXP_ID: string;
    readonly _redID: string;
    readonly _participantID: string;

    _trial: Trial;

    public registerNewTrial(trial: Trial) : void {}
    public logFrameInfo(timestamp: number, trialNumber: number, speed: number, state: number) : void {}
    public logTrialInfo(trialNumber: number, discomfortScore: number) : void {}
    public logCoinPickup(timestamp: number) : void {}
    public quitDataCollection() : void {}
}
