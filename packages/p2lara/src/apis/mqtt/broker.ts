import mosca from "mosca";

export default class Broker {
  constructor() {

    const ascoltatore = {
      //using ascoltatore
      mongo: {},
      pubsubCollection: "ascoltatori",
      type: "mongo",
      url: "mongodb://mongodb:27017/mqtt"
    };

    const settings = {
      port: 1883,
      backend: ascoltatore,
      persistence: {
        factory: mosca.persistence.Mongo,
        url: "mongodb://mongodb:27017/mosca-persistence"
      }
    };

    const server = new mosca.Server(settings);

    // tslint:disable-next-line: no-console
    server.on("ready", () => console.log("Dingjs MQTT broker ready !"));

    server.on("clientConnected", (client: any) => {
      // tslint:disable-next-line: no-console
      console.log("client connected", client.id);
    });
  }
}
