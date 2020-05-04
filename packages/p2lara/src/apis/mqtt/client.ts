import mqtt from "mqtt";

export default class Client {

  protected client: mqtt.MqttClient;

  constructor() {
    this.client = mqtt.connect("mqtt://localhost");
  }

  public publishData(data: object) {
    const options: mqtt.IClientPublishOptions = {
      qos: 0,
      retain: true
    }

    data["timestamp"] = (new Date()).toISOString();
    this.client.publish(
      `sensor/${data.id}`,
      JSON.stringify(data),
      options
      );
  }

};