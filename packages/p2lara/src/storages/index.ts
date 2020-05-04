import Ding from "../ding";
import InfluxDB from "./influxdb";
import MongoDB from "./mongodb";

export default class StorageManager {
  protected influxdb: InfluxDB;
  protected mongodb: MongoDB;

  constructor(dingjs: Ding) {
    this.influxdb = new InfluxDB(dingjs.getConfig());
    this.mongodb = new MongoDB();
  }

  public getInfluxdb() {
    return this.influxdb;
  }
}
