// import Influx from 'influx';
import Filter from './filter';
import Influx = require("influx");

export default class InfluxDB {

  protected influx: any;
  protected service :string = 'ttn';

  constructor(config: any) {

    // const fields {};
    // config.data.ttn.forEach(item => {
    //   fields[item] = Influx.FieldType.INTEGER
    // });
    this.influx = new Influx.InfluxDB({
      database: "dingjs",
      host: "influxdb",
      // schema: [
      //   {
      //     measurement: 'ttn',
      //     fields: {
      //       path: Influx.FieldType.STRING,
      //       duration: Influx.FieldType.INTEGER
      //     },
      //     tags: [
      //       'id'
      //     ]
      //   }
      // ]
    });
    this.influx.createDatabase("dingjs");
  }

  /**
   * writeMeasurement
   */
  public writeMeasurement(data: any) {
    // tslint:disable-next-line:no-console
    console.log("Write data to influxdb;");

    const id = data.id;

    const fields = Object.assign({}, data);
    delete fields.id;
    this.influx.writeMeasurement("ttn", [
      {
        fields,
        tags: { id },
      }
    ]);
  }

  public readEntities(entity :string) {
    return this.influx.query(`show tag values from ${this.service} with key = "id";`);
  }

  public readMeasurements(entity :string, id: string, filter: Filter = new Filter({})) {
    let query = 'select ' + (filter.is_grouped() ? `MEAN(${entity})` : `${entity}`);
    query += ` from ${this.service} where id = '${id}'
    and time > now() - ${filter.get_period()}`
    query += (filter.is_grouped() ? ` GROUP by time(${filter.get_interval()}) fill(none)` : '');  
    query += ` ORDER BY time DESC limit ${filter.get_limit()}`;
    return this.influx.query(query);
  }
}
