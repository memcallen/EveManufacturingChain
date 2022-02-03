
import * as m from "mithril";
import { IndyCompareConfig } from "../../../data/models/IndyConfig";

interface IndyCompareArgs {
    attrs: {
        config: IndyCompareConfig;
        setConfig: (config: IndyCompareConfig)=>void;
        result?;
    };
};

const Config = {
    view: ({}) => {
        return m(".ic-config", [
            
        ]);
    }
};

const IndyCompare = {
    view: ({ attrs: { config, setConfig, result }}: IndyCompareArgs) => {
        return m(".content-width-large", m(".ic-content", [
            m(Config, {
                config,
                setConfig,
                result
            }),

            m(IndyDetails, {
                config,
                setConfig,
                result
            }),
        ]));
    }
};
