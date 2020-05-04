import { data } from "ttn";
import Ding from "../ding";
import InfluxDB from "../storages/influxdb";
import Input from "./input";

export default class TtnInput extends Input {

  constructor(dingjs: Ding) {
    super(dingjs);

    const { application_id, access_token } = this.config.getTtn();

    data(application_id, access_token)
      .then((client: any) => {
        client.on("uplink", (devId: string, payload: any) => {
          const result: any = { id: devId };
          this.data.ttn.forEach((item: string | number) => {
            if (payload.payload_fields[item] !== undefined) {
              result[item] = payload.payload_fields[item];
            }
          });
          dingjs.handle(result);
          // tslint:disable-next-line:no-console
          console.log(result);
        });
      })
      .catch((err: any) => {
        // tslint:disable-next-line:no-console
        console.error(err);
      });
  }
}
