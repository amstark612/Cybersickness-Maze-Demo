export class TrialInfo {
    public coinsCollected: number;
    public startTime: number;
    public endTime: number;

    constructor(coinsCollected: number, startTime: number, endTime: number) {
        this.coinsCollected = coinsCollected;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}