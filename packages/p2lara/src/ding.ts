import ApiManager from "./apis";
import Config from "./conf/config";
import InputManager from "./inputs";
import OutputManager from "./outputs";
import StorageManager from "./storages/";

export default class Ding {
  protected config: any;
  protected apis: ApiManager;
  protected storages: StorageManager;
  protected inputs: InputManager;
  protected outputs: OutputManager;

  constructor() {
    this.config = new Config();
    this.storages = new StorageManager(this);

    this.apis = new ApiManager(this);
    this.outputs = new OutputManager(this);
    this.inputs = new InputManager(this);

    // tslint:disable-next-line:no-console
    console.log("Ding.js up and running.");
  }

  public getConfig(): Config {
    return this.config;
  }

  public getStorages(): StorageManager {
    return this.storages;
  }

  public getApis(): ApiManager {
    return this.apis;
  }

  public handle(data: object) {
    this.storages.getInfluxdb().writeMeasurement(data);
    this.apis.getMqtt().publishData(data);
  }
}
