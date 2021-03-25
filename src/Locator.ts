import { IDataCollector } from "./IDataCollector";
import { NullDataCollector } from "./NullDataCollector";

export class Locator {
  private static _instance: Locator;
  private static _nullDataCollector: IDataCollector =
    new NullDataCollector();
  private static _dataCollector : IDataCollector;

  private constructor() { }

  public static getInstance() : Locator {
    if (!this._instance) {
     this._instance = new Locator();
    }

    return this._instance;
  }

  public static provide(dataCollector: IDataCollector) {
    if (dataCollector == null) {
      this._dataCollector = this._nullDataCollector;
    }
    else {
      this._dataCollector = dataCollector;
    }
  }

  public static getDataCollector() : IDataCollector {
    return this._dataCollector;
  }
}
