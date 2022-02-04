
import * as m from "mithril";
import { filter, map } from "lodash";
import { IndyConfig, IndyNode } from "../../../data/models/IndyConfig";
import { TYPES } from "../../../data/type";
import { PopupMenuHooks } from "../../components/PopupMenu/PopupMenu";
import { FormatTime } from "../../../util/format_utils";
import { PopupMenuButton, RenderPopupMenu } from "./PopupMenuHelpers";

import './SummaryView.scss';
import { PriceView } from "../../components/PriceView/PriceView";

const Table = {
    view: ({ attrs: { title, headers, rows } }) => {
        return m(".summary-table", {style: {"--columns": headers.length}}, [
            m(".summary-table-title", {style: {"--columns": headers.length+1}}, title),

            map(headers, col => m(".summary-table-header", col)),

            map(rows, row => map(row, cell => m(".summary-table-cell", cell)))
        ]);
    }
};

interface Args {
    attrs:{
        config:IndyConfig;
        summary:IndyNode[];
        onRulesChanged: (build_rules, purchase_rules, input_rules)=>void;
        onOutputChanged: (output)=>void;
        onPriceRulesChanged: (rules)=>void;
    };
    state: {
        PopupMenu;
        showPopupMenu;
    };
};

export const SummaryView = {
    oninit: ({ state }: Args) => {
        const {showPopupMenu, PopupMenu} = PopupMenuHooks();
        state.showPopupMenu = showPopupMenu;
        state.PopupMenu = PopupMenu;
    },

    view: ({ state, attrs: { config, summary, onRulesChanged, onOutputChanged, onPriceRulesChanged } }: Args) => {
        const builds = filter(summary, e => e.src == "build");
        const purchases = filter(summary, e => e.src == "purchase");
        const inputs = filter(summary, e => e.src == "input");

        return summary && m(".summary-outer", [
            builds.length > 0 && m(Table, {
                title: "Build",
                headers: ["Type Name", "Run Count", "Quantity", "Installation Fee", "Duration", ""],
                rows: builds.map(e => [
                    m("a", {href: `https://evemarketer.com/types/${e.typeid}`}, TYPES[e.typeid].name),
                    e.runs.toLocaleString(),
                    e.quantity.toLocaleString(),
                    0,
                    FormatTime(e.duration),
                    m(PopupMenuButton, {showPopupMenu: state.showPopupMenu, data: e})
                ])
            }),

            purchases.length > 0 && m(Table, {
                title: "Purchases",
                headers: ["Type Name", "Quantity", "Price (Total)", "Price (Unit)", ""],
                rows: purchases.map(e => [
                    m("a", {href: `https://evemarketer.com/types/${e.typeid}`}, TYPES[e.typeid].name),
                    e.quantity.toLocaleString(),
                    m(PriceView, {
                        price_rules: config.price_rules,
                        typeid: e.typeid,
                        amt: e.quantity,
                        default_price: "b",
                        onPriceRulesChanged
                    }),
                    m(PriceView, {
                        price_rules: config.price_rules,
                        typeid: e.typeid,
                        amt: 1,
                        default_price: "b",
                        onPriceRulesChanged
                    }),
                    m(PopupMenuButton, {showPopupMenu: state.showPopupMenu, data: e})
                ])
            }),

            inputs.length > 0 && m(Table, {
                title: "Inputs",
                headers: ["Type Name", "Quantity"],
                rows: inputs.map(e => [
                    TYPES[e.typeid].name,
                    e.quantity
                ])
            }),
            
            RenderPopupMenu(state.PopupMenu, config, onRulesChanged, onOutputChanged)
        ]);
    }
}
