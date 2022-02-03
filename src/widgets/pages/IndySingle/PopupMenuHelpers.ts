
import * as m from "mithril";
import { MARKET_GROUPS } from "../../../data/market";
import { IndyConfig, IndyNode } from "../../../data/models/IndyConfig";
import { TYPES } from "../../../data/type";

export const onMenuClicked = (config: IndyConfig, data: IndyNode, path) => {
    const [action, rule_group, [object_type, id]]: [
        "add"|"remove",
        "build"|"purchase"|"input",
        ["type"|"marketgroup", number]] = path;

    const rule_list = {
        "build": config.build_rules,
        "purchase": config.purchase_rules,
        "input": config.input_rules
    }[rule_group];
    
    for(const i in rule_list) {
        const _rule = rule_list[i];

        if(_rule.rule_type == object_type && (_rule.group?.id || _rule.type?.id) == id) {
            rule_list.splice(+i, 1);
        }
    }

    if(action == "add") {
        if(object_type == "marketgroup") {
            const group = MARKET_GROUPS[id];
            rule_list.push({
                name: group.name,
                rule_type: "marketgroup",
                group: group
            });
        } else {
            const type = TYPES[id];
            rule_list.push({
                name: type.name,
                rule_type: "type",
                type: type
            });
        }
    }
};

interface Menu {
    [label: string]: Menu | ((data: any, path: any[])=>void);
}

function _makeMenu(handler: (data: any, path: any[])=>void, path, section, ...next): Menu {
    var obj: Menu = {};

    for(var [label, pname] of section) {
        const _path = path.concat([pname]);
        obj[label] = next.length == 0 ? 
            (data => handler(data, _path)) :
            _makeMenu(handler, _path, next[0], ...next.slice(1));
    }

    return obj;
}

export function makeMenu(handler: (data: any, path: any[])=>void, ...sections): Menu {
    return sections.length > 0 ?
        _makeMenu(handler, [], sections[0], ...sections.slice(1)) :
        {};
}

export function getTypeMenuLabels(e: IndyNode) {
    var labels = [[TYPES[e.typeid].name, ["type", e.typeid]]];

    var group = MARKET_GROUPS[TYPES[e.typeid].market_group_id];

    while(group) {
        labels.push([group.name, ["marketgroup", group.id]]);
        group = MARKET_GROUPS[group.parent_id];
    }

    return labels;
}

export function RenderPopupMenu(PopupMenu, config: IndyConfig, onRulesChanged, onOutputChanged) {
    return m(PopupMenu, {
        menu: data => data ? {
            "Set as Output": (data: IndyNode) => {
                console.log(data);
                onOutputChanged({
                    type: TYPES[data.typeid],
                    quantity: data.quantity
                });
            },
            ...makeMenu(
                (data, path) => {
                    onMenuClicked(config, data, path);
                    onRulesChanged(config.build_rules, config.purchase_rules, config.input_rules);
                },
                [["Add to", "add"], ["Remove from", "remove"]],
                [["Build Rule", "build"], ["Purchase Rule", "purchase"], ["Input Rule", "input"]],
                getTypeMenuLabels(data)
            )
        } : {}
    });
}

export const PopupMenuButton = {
    view: ({ attrs: { showPopupMenu, data, text="…" } }) => {
        return m("button", {onclick: evt => showPopupMenu(evt.clientX, evt.clientY, data)}, text);
    }
};
