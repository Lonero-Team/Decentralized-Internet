import ApiManager from "../apis";
import Config from "../conf/config";
import Ding from "../ding";
import StorageManager from "../storages/";

export default class Input {

    protected config: Config;
    protected data: any;
    protected metadata: any;
    protected storages: StorageManager;
    protected apis: ApiManager;

    constructor(context: Ding) {
        this.config = context.getConfig();
        this.data = this.config.getData();
        this.metadata = this.config.getMetaData();
        this.storages = context.getStorages();
        this.apis = context.getApis();
    }
}
