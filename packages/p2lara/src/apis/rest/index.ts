import FilterBuilder from "./factories/filter_builder";
import Ding from "../../ding";

export default class Rest {
  constructor(dingjs: Ding) {
    const express = require("express");
    const app = express();
    const port = 3000;

    const influxdb = dingjs.getStorages().getInfluxdb();

    app.get("/", (req: any, res: any) => {
      res.send("Welcome to Ding.js. We are up and running.");
    });

    app.get("/api/:entity", (req: any, res: any) => {
      const entity = req.params.entity;
      
      influxdb.readEntities(entity)
        .then(result => res.send(result))
        .catch(err => res.send(err))
    });

    app.get("/api/:entity/:id", (req: any, res: any) => {
      const entity = req.params.entity;
      const id = req.params.id;
      const filter = FilterBuilder.build(req.query);

      influxdb.readMeasurements(entity, id, filter)
        .then(result => res.json(result))
        .catch(err => res.json(err))
    });

    // tslint:disable-next-line:no-console
    app.listen(port, () => console.log(`Ding.js REST api listening on port ${port}!`));
  }
}
