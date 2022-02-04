import { max } from "lodash";
import { IndyConfig, IndyConfigData, loadConfig, saveConfig } from "../models/IndyConfig";
import { StorageHelper } from "./StorageHelper";

export const ConfigService = {

    storage: new StorageHelper<{[id:number]:IndyConfigData}>("configs", {}),

    getAllConfigs: () => {
        return ConfigService.storage.get();
    },

    findConfig: (config_id:number) => {
        const data = ConfigService.storage.get()[config_id];

        return data && { ...loadConfig(data), id: +config_id } || null;
    },

    saveConfig: (config_id: number|null, config: IndyConfig) => {
        ConfigService.storage.mutate(configs => {
            if(config_id == null) {
                config_id = !!configs ? (max(Object.keys(configs).map(x => +x)) || 0) + 1 : 1;
            }

            configs[config_id] = saveConfig({
                ...config,
                updated: new Date(),
            });
            return configs;
        });

        return config_id;
    },
};
