
import { map } from "lodash";
import * as m from "mithril";
import { IndyConfig, InputRule } from "../../../data/models/IndyConfig";
import { TYPES } from "../../../data/type";
import { MARKET_GROUPS } from "../../../data/market";
import { Accordion } from "../Accordion/Accordion";
import { TypeSelector } from "../TypeSelector/TypeSelector";

import "./InputRuleEditor.scss";

interface InputRuleRowArgs {
    attrs: {
        rule: InputRule;
        onRemove: ()=>void;
        onRulesChanged: ()=>void;
    }
};

const InputRuleRow = {
    view({ attrs: { rule, onRemove, onRulesChanged } }: InputRuleRowArgs) {
        return m(".ir-row.row", [
            m("a.btn.ir-row-btn", {onclick: onRemove}, "✕"),
            m(".label", rule.name),
            m(".gap"),
            m("a.btn.ir-row-btn", {onclick: () => {rule.paused = !rule.paused;onRulesChanged();}}, [
                rule.paused ? m("i.fa.fa-pause") : m("i.fa.fa-play"),
            ])
        ]);
    }
}

const InputRuleRowAdd = {
    view({ attrs: { onAddRow } }) {
        return m(".input-rule-add", [
            m("a.btn.ir-row-btn", {onclick: onAddRow}, "+"),
            m(".gap")
        ])
    }
};

interface InputRuleSectionArgs {
    attrs: {
        rules: InputRule[];
        onAddRow: ()=>void;
        onRemoveRow: (x:InputRule)=>void;
        onRulesChanged: ()=>void;
    }
};

const InputRuleSection = {
    view({ attrs: { rules, onAddRow, onRemoveRow, onRulesChanged } }: InputRuleSectionArgs) {
        return m(".input-rule-section", [
            map(rules, rule => {
                return m(InputRuleRow, {
                    rule,
                    onRemove: () => onRemoveRow(rule),
                    onRulesChanged
                });
            }),

            m(InputRuleRowAdd, {onAddRow: onAddRow})
        ])
    }
};

interface InputRuleEditorArgs {
    attrs: {
        input_rules: InputRule[],
        purchase_rules: InputRule[],
        build_rules: InputRule[],
        onRulesChanged: (build: InputRule[], purchase: InputRule[], input: InputRule[])=>void;
    };

    state: {
        selector_rule_list: InputRule[] | null;
        selector_visible: boolean;
    };
};

export const InputRuleEditor = {

    view: ({ attrs: { input_rules, build_rules, purchase_rules, onRulesChanged }, state } : InputRuleEditorArgs) => {

        const onAddRow = (rule_list: InputRule[]) => {
            state.selector_rule_list = rule_list;
            state.selector_visible = true;
        }

        const onRemoveRow = (rule_list: InputRule[], rule: InputRule) => {
            const idx = rule_list.indexOf(rule);

            if(idx == -1) {
                return;
            }

            rule_list.splice(idx, 1);

            onRulesChanged(build_rules, purchase_rules, input_rules);
        }

        const onFinishAddRow = (types: number[], groups: number[]) => {
            state.selector_visible = false;

            var modified = false;

            for(const tid of types) {
                const type = TYPES[tid];

                state.selector_rule_list.push({
                    rule_type: "type",
                    name: type.name,
                    type: type
                });

                modified = true;
            }

            for(const gid of groups) {
                const group = MARKET_GROUPS[gid];

                state.selector_rule_list.push({
                    rule_type: "marketgroup",
                    name: group.name,
                    group: group
                });

                modified = true;
            }

            if(modified) {
                onRulesChanged(build_rules, purchase_rules, input_rules);
                m.redraw();
            }
        }

        return m(".input-rule-editor", [
            m(Accordion, [
                m(InputRuleSection, {
                    key: "Externally Supplied",
                    rules: input_rules,
                    onAddRow: () => {
                        state.selector_rule_list = input_rules;
                        state.selector_visible = true;
                    },
                    onRemoveRow: rule => onRemoveRow(input_rules, rule),
                    onRulesChanged: () => onRulesChanged(build_rules, purchase_rules, input_rules)
                }),
                m(InputRuleSection, {
                    key: "To Purchase",
                    rules: purchase_rules,
                    onAddRow: () => onAddRow(purchase_rules),
                    onRemoveRow: rule => onRemoveRow(purchase_rules, rule),
                    onRulesChanged: () => onRulesChanged(build_rules, purchase_rules, input_rules)
                }),
                m(InputRuleSection, {
                    key: "To Build",
                    rules: build_rules,
                    onAddRow: () => onAddRow(build_rules),
                    onRemoveRow: rule => onRemoveRow(build_rules, rule),
                    onRulesChanged: () => onRulesChanged(build_rules, purchase_rules, input_rules)
                }),
            ]),

            state.selector_visible && m(TypeSelector, {
                multiple: true,
                types_only: false,
                inherit_selection: true,

                onclose: () => state.selector_visible = false,
                onsubmit: (types: number[], groups: number[]) => onFinishAddRow(types, groups)
            })
        ]);
    }
};
