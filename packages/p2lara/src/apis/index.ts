import Ding from "../ding";
import GraphQL from "./graphql";
import Broker from "./mqtt/broker";
import Client from "./mqtt/client";
import Rest from "./rest";

export default class ApiManager {
  protected graphql: GraphQL;
  protected broker: Broker;
  protected mqtt: Client;
  protected rest: Rest;

  constructor(dingjs: Ding) {
    this.graphql = new GraphQL();
    this.broker = new Broker();
    this.mqtt = new Client();
    this.rest = new Rest(dingjs);
  }

  public getMqtt(): Client {
    return this.mqtt;
  }
}
