import config from "./configuration";

export default class Config {
    protected config: any;

    public constructor() {
        this.config = config;
    }

    public getTtn(): any {
        return this.config.mqtt;
    }

    public getData(): any {
        return this.config.data;
    }

    public getMetaData(): any {
        return this.config.getMetaData;
    }
}
