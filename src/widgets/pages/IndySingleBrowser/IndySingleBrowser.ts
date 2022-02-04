
import * as m from "mithril";
import { ConfigService } from "../../../data/services/ConfigService";
import { getRedirectHash, redirectTo } from "../../..";
import { Table } from "../../components/Table/Table";

import './IndySingleBrowser.scss';
import { IndyConfig, loadConfig } from "../../../data/models/IndyConfig";
import { IndySingleId } from "../IndySingle/IndySingle";
import { TypeIcon } from "../../components/itemicon";

interface SearchArgs {
    attrs: {
        search_text: string;
        setSearchText: (x: string)=>void;
    };
};

const Search = {
    view: ({ attrs: { search_text, setSearchText } } : SearchArgs) => {
        return m(".row", [
            m("input", {
                value: search_text,
                onkeyup: evt => setSearchText(evt.target.value),
                onchange: evt => setSearchText(evt.target.value),
                placeholder: "Search Name / Output",
            })
        ]);
    }
};

interface IndySingleBrowserArgs {
    attrs: {

    };
    state: {
        search_text?: string;
    };
};

export const IndySingleBrowser = {
    view: ({ attrs: {  }, state } : IndySingleBrowserArgs) => {
        const configs = Object.values(ConfigService.getAllConfigs())
            .map(cfg => loadConfig(cfg))
            .filter(cfg => !state.search_text ||
                            (cfg.name && cfg.name.toLowerCase().indexOf(state.search_text) !== -1) ||
                            (cfg.output?.type?.name && cfg.output.type.name.toLowerCase().indexOf(state.search_text) !== -1))
            .sort((a, b) => b.updated.getTime() - a.updated.getTime());

        return m(".content-width-large", m(".indy-browser-content", [
            
            m(Search, {
                search_text: state.search_text,
                setSearchText: text => state.search_text = text?.toLowerCase()
            }),
            
            m(Table, {
                title: "Industry Configurations",
                headers: [
                    null,
                    "Name",
                    "Output",
                    "Date Updated",
                    null,
                    null
                ],
                rows: configs.map(config => {
                    return [
                        m(TypeIcon, {
                            id: config.output.type.id,
                            size: 32
                        }),
                        config.name || "Unnamed config",
                        m("span.indy-browser-config-name", config.output.type.name),
                        config.updated.toLocaleString(),
                        m("input", {
                            type: "button",
                            value: "Edit",
                            onclick: () => {
                                redirectTo(IndySingleId, {
                                    id: config.id.toString()
                                });
                            }
                        }),
                        m("input", {
                            type: "button",
                            value: "Delete",
                            disabled: true,
                            onclick: () => {
                                redirectTo(IndySingleId, {
                                    id: config.id.toString()
                                });
                            }
                        })
                    ];
                })
            })
        ]));
    }
};
