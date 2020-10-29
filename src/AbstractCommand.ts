import { App } from "./App";

abstract class Command
{
    protected app: App;

    constructor(app: App)
    {
        this.app = app;
    }

    abstract execute() : void;
}