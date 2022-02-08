
import * as m from "mithril";
import { IndyConfig, IndyResult, loadConfig, newConfig, saveConfig } from "../../../data/models/IndyConfig";
import { InputRuleEditor } from "../../components/InputRuleEditor/InputRuleEditor";
import { Tab, TabView } from "../../components/TabView/TabView";
import { getIndustryResults } from "../../../data/services/WebDataService";
import { OutputView } from "./OutputView";
import { SummaryView } from "./SummaryView";
import { GraphView } from "./GraphView";
import { ConfigService } from "../../../data/services/ConfigService";
import { Pricing } from "../../../data/services/PriceService";
import { getRedirectHash, redirectTo } from "../../..";

import './IndySingle.scss';

interface Args {
    attrs: {
        config?: IndyConfig;
        setConfig: (config: IndyConfig)=>void;
        result?: IndyResult;
    };
};

const IndyInputs = {
    view: ({ attrs: { config, setConfig } }: Args) => 
    m(".indy-inputs", [
        
        m("input", {
            type: "text",
            value: config.name,
            placeholder: "Name",
            onkeyup: evt => {
                setConfig({
                    ...config,
                    name: evt.target.value || null
                });
            }
        }),

        m(OutputView, {
            output: config.output,
            onOutputChanged: output => {
                setConfig({
                    ...config,
                    output: {
                        ...output,
                        quantity: output.quantity || 0
                    }
                });
            }
        }),

        m(InputRuleEditor, {
            build_rules: config.build_rules,
            purchase_rules: config.purchase_rules,
            input_rules: config.input_rules,
            onRulesChanged: (build_rules, purchase_rules, input_rules) => {
                setConfig({
                    ...config,
                    build_rules,
                    purchase_rules,
                    input_rules
                });
            }
        }),

        m(".row", [
            m("input", {
                type: "button",
                value: "Save",
                onclick: () => {
                    const config_id = ConfigService.saveConfig(config);
                    redirectTo(IndySingleId, {
                        id: config_id.toString()
                    });
                }
            }),

            m("input", {
                type: "button",
                value: "Copy Sharable Link",
                onclick: () => {
                    const prehash = window.location.href.split("#")[0];

                    navigator.clipboard.writeText(prehash + getRedirectHash(IndySingleShare, {}, {
                        config: saveConfig({
                            ...config,
                            id: null
                        })
                    }));
                }
            }),
        ]),

        m(".row", [
            m("input", {
                type: "button",
                value: "Copy to Clipboard",
                onclick: () => {
                    navigator.clipboard.writeText(JSON.stringify(saveConfig(config)));
                }
            }),

            m("input", {
                type: "button",
                value: "Load from Clipboard",
                onclick: () => {
                    navigator.clipboard.readText().then(data => {
                        setConfig(loadConfig(JSON.parse(data)));
                    });
                }
            })
        ]),
        m(".row", [
            m("input", {
                type: "button",
                value: "Refetch Pricing",
                onclick: () => {
                    Pricing.clear();
                    m.redraw();
                }
            }),
        ]),
    ]),

};

const IndySummary = {
    view: ({ attrs: { config, setConfig, result } }: Args) =>
    m(SummaryView, {
        config: config,
        summary: result?.summary,
        onRulesChanged: (build_rules, purchase_rules, input_rules) => {
            setConfig({
                ...config,
                build_rules,
                purchase_rules,
                input_rules
            });
        },
        onOutputChanged: (output) => {
            setConfig({
                ...config,
                output
            });
        },
        onPriceRulesChanged: (price_rules) => {
            setConfig({
                ...config,
                price_rules
            });
        }
    })
}

const IndyGraph = {
    view: ({ attrs: { config, setConfig, result } }: Args) =>
    m(GraphView, {
        config: config,
        roots: [result?.graph],
        onRulesChanged: (build_rules, purchase_rules, input_rules) => {
            setConfig({
                ...config,
                build_rules,
                purchase_rules,
                input_rules
            });
        },
        onOutputChanged: (output) => {
            setConfig({
                ...config,
                output
            });
        },
        onPriceRulesChanged: (price_rules) => {
            setConfig({
                ...config,
                price_rules
            });
        }
    })
};

const IndyDetails = {
    view: ({ attrs: { config, setConfig, result } }: Args) => 
    m(".indy-details", [
        m(TabView, [
            m(Tab, {tabname: "Summary", tabenabled: !!result}, [
                m(IndySummary, {
                    config,
                    setConfig,
                    result
                })
            ]),
            m(Tab, {tabname: "Graph", tabenabled: !!result}, [
                m(IndyGraph, {
                    config,
                    setConfig,
                    result
                })
            ]),
            // m(Tab, {tabname: "Waterfall", tabenabled: !!result}, "Waterfall"),
        ])
    ])
};

const IndySingle = {
    view: ({ attrs: { config, setConfig }}: Args) => {
        var result: IndyResult;
        try {
            result = getIndustryResults(config);
        } catch { }

        return m(".content-width-large", m(".indy-content", [
            m(IndyInputs, {
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

interface IndySingleUnsavedArgs {
    state: {
        config?: IndyConfig
    };
};

export const IndySingleUnsaved = {
    oninit: ({ state }: IndySingleUnsavedArgs) => {
        state.config = newConfig();
    },

    view: ({ state }: IndySingleUnsavedArgs) => {
        return m(IndySingle, {
            config: state.config,
            setConfig: (config) => {
                state.config = config;
                m.redraw();
            }
        });
    }
};

interface IndySingleIdArgs {
    state: {
        config?: IndyConfig;
    };
    attrs: {
        id?: number;
    };
};

export const IndySingleId = {
    reload: (state, id) => {
        state.config = ConfigService.findConfig(id) || newConfig();
    },

    oninit: ({ state, attrs: { id } }: IndySingleIdArgs) => {
        IndySingleId.reload(state, id);
    },

    view: ({ state, attrs: { id } }: IndySingleIdArgs) => {
        if(+id != state?.config?.id) {
            IndySingleId.reload(state, +id);
        }

        return m(IndySingle, {
            config: state.config,
            setConfig: (config) => {
                state.config = config;
                m.redraw();
            }
        });
    }
};

interface IndySingleShareArgs {
    state: {
        config?: IndyConfig;
        str?: string;
    };
    attrs: {
        config?: string;
    };
};

export const IndySingleShare = {
    reload: (state, config) => {
        state.config = config ? 
            {
                ...loadConfig(JSON.parse(config)),
                id: null,
                updated: new Date()
            } :
            newConfig();
        state.str = config || JSON.stringify(saveConfig(state.config));
    },

    oninit: ({ state, attrs: { config } }: IndySingleShareArgs) => {
        IndySingleShare.reload(state, config);
    },

    view: ({ state, attrs: { config } }: IndySingleShareArgs) => {
        if(state.str != config) {
            IndySingleShare.reload(state, config);
        }

        return m(IndySingle, {
            config: state.config,
            setConfig: (config) => {
                state.config = config;
                m.redraw();
            }
        });
    }
};
