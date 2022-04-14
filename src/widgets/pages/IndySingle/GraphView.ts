
import * as m from "mithril";
import { IndyConfig, IndyNode } from "../../../data/models/IndyConfig";
import { TYPES } from "../../../data/type";
import { TypeIcon } from "../../components/itemicon";
import { PopupMenuHooks } from "../../components/PopupMenu/PopupMenu";
import { FormatPrice, FormatTime, getPrice, Price } from "../../../util/format_utils";
import { PopupMenuButton, RenderPopupMenu } from "./PopupMenuHelpers";
import { Activity } from "../../../data/blueprints";

import './GraphView.scss';
import { PriceView } from "../../components/PriceView/PriceView";

const InputPrice = (price_rules, node: IndyNode) => node?.inputs
    ?.map(tq => getPrice(price_rules, node?.children.find(x => x.typeid == tq.id)) || null)
    ?.reduce((acc, x) => x != null && acc != null ? acc + x : null, 0);

const NumberFormat = (x: number) => x % 1 != 0 ? x.toFixed(2) : x?.toString();

interface NodeViewArgs {
    attrs: {
        showPopupMenu;
        node: IndyNode;
        amt?: number;
        depth?: number;
        parent?: IndyNode;
        price_rules: {[typeid:number]:"b"|"s"};
        onPriceRulesChanged: (price_rules)=>void;
        isLast?: boolean;
        expandAll?: boolean;
        hideAll?: boolean;
    };
    state: {
        collapsed?: boolean;
        hidden?: boolean;
    };
};

const NodeView = {
    view: ({ attrs: { showPopupMenu, node, depth, price_rules, onPriceRulesChanged, isLast, expandAll, hideAll }, state }: NodeViewArgs) => {
        
        depth = depth || 1;

        if(state.collapsed == null) {
            state.collapsed = depth > 1 ? true : false;
        }

        const isbp = node.src == "build" && node.bp.activity != Activity.planetary_interaction;

        const input_price = InputPrice(price_rules, node);

        return m(".graph-node-outer", [

            m(".graph-node", [

                node.children.length > 0 && (!state.collapsed || expandAll) && m(".graph-node-line-parent"),

                node.children.length > 0 && !expandAll && m("a.btn.graph-node-collapser",
                    {onclick: () => state.collapsed = !state.collapsed},
                    state.collapsed ? "-" : "+"),

                !hideAll && m("a.btn.graph-node-visible",
                    {onclick: () => state.hidden = !state.hidden},
                    state.hidden ? m("i.fa.fa-eye-slash") : m("i.fa.fa-eye")),

                m(".graph-node-popup-btn", m(PopupMenuButton, {showPopupMenu, data: node})),

                isbp ? 
                    m(TypeIcon, {id: node.bp.blueprint_id, type: "bp"}) :
                    m(TypeIcon, {id: node.typeid, type: "icon"}),

                m("a.graph-node-name", {href: `https://evemarketer.com/types/${node.typeid}`}, TYPES[node.typeid].name),

                (!state.hidden && !hideAll) && [
                    node.src == "build" && [
                        `${NumberFormat(node.quantity)} (${NumberFormat(node.runs)} run${node.runs == 1 ? "" : "s"})`,
                        FormatTime(node.duration),
                        "Total:",
                        m(PriceView, {
                            typeid: node.typeid,
                            amt: node.quantity,
                            default_price: "s",
                            price_rules,
                            onPriceRulesChanged,
                        }),
                        "Unit:",
                        m(PriceView, {
                            typeid: node.typeid,
                            amt: 1,
                            default_price: "s",
                            price_rules,
                            onPriceRulesChanged,
                        }),
                        "Inputs:",
                        FormatPrice(input_price),
                        "Profit:",
                        FormatPrice(getPrice(price_rules, node) - input_price),
                        "Per Hour Per Slot:",
                        FormatPrice((getPrice(price_rules, node) - input_price) / (node.duration / 60 / 60)),
                    ].map(s => m("span", s)),
    
                    node.src == "purchase" && [
                        node.quantity?.toLocaleString(),
                        "Total:",
                        m(PriceView, {
                            typeid: node.typeid,
                            amt: node.quantity,
                            default_price: "s",
                            price_rules,
                            onPriceRulesChanged,
                        }),
                        "Unit:",
                        m(PriceView, {
                            typeid: node.typeid,
                            amt: 1,
                            default_price: "s",
                            price_rules,
                            onPriceRulesChanged,
                        }),
                    ].map(s => m("span", s)),
                ]
            ]),

            node.children.length > 0 && (!state.collapsed || expandAll) && m(".graph-node-children", [
                [...node.children]
                    .sort((a, b) => getPrice(price_rules, b) - getPrice(price_rules, a))
                    .map((child, idx, arr) => m(NodeView, {
                        node: child,
                        depth: depth + 1,
                        showPopupMenu,
                        price_rules,
                        onPriceRulesChanged,
                        isLast: idx == arr.length - 1,
                        expandAll,
                        hideAll
                    }))
            ]),

            node.parents.length > 0 && m(isLast ?
                    ".graph-node-line-child-last" :
                    ".graph-node-line-child")
        ]);
    }
};

export interface GraphViewArgs {
    attrs: {
        config: IndyConfig;
        onRulesChanged: (build,purchase,inputs)=>void;
        roots: IndyNode[] | null;
        onOutputChanged: (output)=>void;
        onPriceRulesChanged: (rules)=>void;
    };
    state: {
        PopupMenu;
        showPopupMenu;
        expandAll?: boolean;
        hideAll?: boolean;
    }
};

export const GraphView = {
    oninit: ({ state }: GraphViewArgs) => {
        const {showPopupMenu, PopupMenu} = PopupMenuHooks();
        state.showPopupMenu = showPopupMenu;
        state.PopupMenu = PopupMenu;
    },

    view: ({ attrs: { config, roots = [], onRulesChanged, onOutputChanged, onPriceRulesChanged }, state }: GraphViewArgs) => {
        return m(".graph-view-outer", [
            m(".col", [
                m(".row.graph-controls-row", [
                    m("div", [
                        m("input", {
                            id: "expand-all-cb",
                            type: "checkbox",
                            onchange: evt => state.expandAll = evt.target.checked
                        }),
                        m("label", {
                            for: "expand-all-cb",
                        }, "Expand All"),
                    ]),
                    m("div", [
                        m("input", {
                            id: "hide-all-details-cb",
                            type: "checkbox",
                            onchange: evt => state.hideAll = evt.target.checked
                        }),
                        m("label", {
                            for: "hide-all-details-cb",
                        }, "Hide All Details"),
                    ])
                ])
            ]),

            roots.map(node => m(NodeView, {
                node,
                showPopupMenu: state.showPopupMenu,
                price_rules: config.price_rules,
                onPriceRulesChanged,
                expandAll: state.expandAll || false,
                hideAll: state.hideAll || false,
            })),

            RenderPopupMenu(state.PopupMenu, config, onRulesChanged, onOutputChanged)
        ]);
    }
};
