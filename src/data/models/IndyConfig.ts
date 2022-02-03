import { map } from "lodash";
import { Blueprint } from "../blueprints";
import { MarketGroup, MARKET_GROUPS } from "../market";
import { TypePricing } from "../services/PriceService";
import { Type, TYPES } from "../type";

export interface InputRule {
    rule_type: "marketgroup" | "type";
    name: string;
    type?: Type;
    group?: MarketGroup;
    paused?: boolean;
};

export interface IndyOutput {
    type: Type;
    quantity?: number;
};

export interface InputRuleData {
    t: "m" | "t";
    id: number;
};

export interface IndyConfigData {
    id: number;
    n: string;
    i: InputRuleData[];
    p: InputRuleData[];
    b: InputRuleData[];
    pr: {[typeid:number]:"b"|"s"};

    o: {id: number, q?: number};
};

function loadInputRule(data: InputRuleData): InputRule {
    if(data.t == "m") {
        const group = MARKET_GROUPS[data.id];
        return {
            rule_type: "marketgroup",
            name: group.name,
            group: group,
            type: null
        };
    } else {
        const type = TYPES[data.id];
        return {
            rule_type: "type",
            name: type.name,
            group: null,
            type: type
        };
    }
}

function saveInputRule(rule: InputRule): InputRuleData {
    if(rule.rule_type == "marketgroup") {
        return {
            t: "m",
            id: rule.group.id
        };
    } else {
        return {
            t: "t",
            id: rule.type.id
        };
    }
}

export interface IndyConfig {
    id: number;
    name: string;

    input_rules: InputRule[];
    purchase_rules: InputRule[];
    build_rules: InputRule[];

    price_rules: {[typeid:number]:"b"|"s"};

    output: IndyOutput;
};

export const newConfig = () => ({
    id: null,
    name: null,
    input_rules: [],
    purchase_rules: [],
    build_rules: [],
    price_rules: {},
    output: null,
});

export const loadConfig = (data: IndyConfigData):IndyConfig => ({
    id: data.id,
    name: data.n,
    input_rules: map(data.i, loadInputRule),
    purchase_rules: map(data.p, loadInputRule),
    build_rules: map(data.b, loadInputRule),
    price_rules: {...data.pr},
    output: {
        type: TYPES[data.o.id],
        quantity: data.o.q
    }
})

export const saveConfig = (config: IndyConfig): IndyConfigData => ({
    id: config.id,
    n: config.name,
    i: map(config.input_rules, saveInputRule),
    p: map(config.purchase_rules, saveInputRule),
    b: map(config.build_rules, saveInputRule),
    pr: {...config.price_rules},

    o: {
        id: config.output?.type?.id,
        q: config.output?.quantity
    }
})

export interface IndyNodeFractional {
    typeid: number;
    quantity?: number;

    unit_price?: TypePricing;
    total_price?: TypePricing;

    runs?: number;
    duration?: number;
    bp?: Blueprint;
    quantity_per_run?: number;

    src: "input"|"build"|"purchase";
    integral: IndyNode;
};

export interface IndyNode {
    typeid: number;
    quantity?: number;

    resolved: boolean;

    unit_price?: TypePricing;
    total_price?: TypePricing;

    runs?: number;
    duration?: number;
    bp?: Blueprint;
    inputs?: {id: number; amt: number; amt_per_quantity: number}[];

    src: "input"|"build"|"purchase";

    children: IndyNode[];
    parents: IndyNode[];
};

export interface WaterfallEntry {
    node: IndyNode;
    start: number;
    duration: number;
    slot: number;
    slot_type: "build" | "science";
};

export interface IndyResult {
    config: IndyConfig;

    summary: IndyNode[];
    graph: IndyNode;
    waterfall: WaterfallEntry[];
};

export interface IndyCompareConfig {
    outputs: InputRule[];

    config: IndyConfig;
};

export interface IndyCompareResults {
    config: IndyCompareConfig;


};
