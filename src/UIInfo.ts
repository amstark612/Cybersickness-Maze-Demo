enum State { START = 0, PAUSED = 1, MAIN = 2, POSTTEST = 3 }

export class UIInfo {
    public gameState: State;
    public newTrial: boolean;
    public findMyWay: boolean;
    public rightHanded: boolean | null = null;
    public discomfortScore: number;

    constructor(state: State, newTrial: boolean) {
        this.gameState = state;
        this.newTrial = newTrial;
        this.discomfortScore = -1;  // App will only process it if >= 0
    }
}