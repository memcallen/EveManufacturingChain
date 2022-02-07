import { Activity, BLUEPRINTS } from "../blueprints";
import { MarketGroup, MARKET_GROUPS } from "../market";
import { BlueprintResearch, IndyConfig, IndyNode, IndyResult, InputRule, WaterfallEntry } from "../models/IndyConfig";
import { Type, TYPES } from "../type";
import { Pricing } from "./PriceService";

function getTypes(group: MarketGroup): Type[] {
    const types: Type[] = [];

    const group_queue: MarketGroup[] = [];

    const fn = (x: MarketGroup) => {
        group_queue.push(x);
        x.children.length > 0 && x.children.forEach(id => fn(MARKET_GROUPS[id]));
    };

    fn(group);

    return group_queue
        .map(grp => grp.types.map(id => TYPES[id]))
        .reduce((acc, x) => acc.concat(x), []);
}

function loadTypes(rules: InputRule[]): Set<number> {

    const types = rules
        .filter(rule => !rule.paused)
        .map(rule => rule.rule_type == "type" ? [rule.type] : getTypes(rule.group))
        .reduce((acc, x) => acc.concat(x), []);

    return new Set(types.map(type => type.id));
}

function getTypeSrc(typeid:number, to_input: Set<number>, to_purchase: Set<number>, to_build: Set<number>) {
    if(to_input.has(typeid)) {
        return "input";
    }
    if(to_purchase.has(typeid)) {
        return "purchase";
    }
    if(to_build.has(typeid)) {
        return "build";
    }
    return "purchase";
}

function isResolvable(node: IndyNode) {
    return node.parents.map(n=>n.resolved).reduce((acc, x) => acc && x, true) && !node.resolved;
}

function getInputAmt(node: IndyNode, input_id: number, bpinfo: {[bpid:number]:BlueprintResearch}) {
    const amt = node.runs * node.bp.inputs[input_id] * (bpinfo[node.bp.blueprint_id]?.materialModifier || 1);
    return Math.max(node.runs, Math.ceil(Math.round(amt*1e2)/1e2));
}

interface WaterfallSettings {
    manufacturing_slots: number;
    science_slots: number;
    batch_length?: number;
};

interface WaterfallInfo {
    node: IndyNode;
    type: "build" | "science";
    start: number;
    duration: number;
    slot: number;
};

function getSummary(config: IndyConfig, to_input: Set<number>, to_purchase: Set<number>, to_build: Set<number>, bpinfo: {[bpid:number]:BlueprintResearch} = {}): IndyNode[] {

    const nodes: {[typeid:number]:IndyNode} = {};

    const fn = (typeid:number, parent:IndyNode) => {
        if(nodes[typeid]) {
            parent && nodes[typeid].parents.push(parent);
            return nodes[typeid];
        }

        const src = getTypeSrc(typeid, to_input, to_purchase, to_build);

        const node: IndyNode = {
            typeid: typeid,
            resolved: false,
            quantity: 0,
            unit_price: Pricing.getPrice(typeid),
            total_price: null,
            src: src,
            parents: parent ? [parent] : [],
            children: []
        };

        if(src == "build") {
            if(!BLUEPRINTS[typeid]) {
                node.src = "purchase";
            } else {
                node.bp = BLUEPRINTS[typeid][0];
                Object.keys(node.bp.inputs).forEach(id => {
                    node.children.push(fn(+id, node));
                });
            }
        }

        nodes[typeid] = node;
        return node;
    };

    const root = fn(config.output.type.id, null);
    root.quantity = config.output.quantity;

    const encounter_order: IndyNode[] = [];
    var i = 0;

    while(!Object.values(nodes).map(n=>n.resolved).reduce((acc, x) => acc && x, true)) {
        const resolvable = Object.values(nodes).find(isResolvable);

        if(resolvable === undefined) {
            console.error("getIndustryResults has lingering nodes that cannot be resolved.", config, nodes);
            throw new Error("getIndustryResults has lingering nodes that cannot be resolved.");
        }

        if(resolvable.parents.length > 0) {
            const amt = resolvable.parents.map(p => getInputAmt(p, resolvable.typeid, bpinfo)).reduce((acc, x) => acc + x, 0);
            
            resolvable.quantity = amt;
        }

        if(resolvable.src == "build") {
            resolvable.runs = Math.ceil(resolvable.quantity / resolvable.bp.output.amt);
            resolvable.duration = resolvable.bp.time * resolvable.runs * (bpinfo[resolvable.bp.blueprint_id]?.timeModifier || 1);

            resolvable.inputs = Object.keys(resolvable.bp.inputs).map(id => ({
                id:+id,
                amt: getInputAmt(resolvable, +id, bpinfo),
                amt_per_quantity: getInputAmt(resolvable, +id, bpinfo) / resolvable.quantity
            }));
        }

        resolvable.resolved = true;
        encounter_order.push(resolvable);

        i++;

        if(i > 10000) {
            throw new Error("getIndustryResults i > 10000. Potential infinite loop was terminated");
        }
    }

    return encounter_order;
}

function getGraph(config: IndyConfig, to_input: Set<number>, to_purchase: Set<number>, to_build: Set<number>, bpinfo: {[bpid:number]:BlueprintResearch} = {}): IndyNode {
    
    const nodes: {[typeid:number]:IndyNode} = {};

    const fn = (typeid:number, amt:number, parent:IndyNode) => {
        if(nodes[typeid]) {
            parent && nodes[typeid].parents.push(parent);
            return nodes[typeid];
        }

        const src = getTypeSrc(typeid, to_input, to_purchase, to_build);

        const node: IndyNode = {
            typeid: typeid,
            quantity: amt,

            resolved: true,

            unit_price: Pricing.getPrice(typeid),
            total_price: null,

            src: src,
            parents: parent ? [parent] : [],
            children: []
        };

        if(src == "build") {
            if(!BLUEPRINTS[typeid]) {
                node.src = "purchase";
            } else {
                node.bp = BLUEPRINTS[typeid][0];
                
                node.runs = amt / node.bp.output.amt;
                node.duration = node.bp.time * node.runs * (bpinfo[node.bp.blueprint_id]?.timeModifier || 1);

                Object.keys(node.bp.inputs).forEach(id => {
                    node.children.push(fn(+id, getInputAmt(node, +id, bpinfo), node));
                });


                node.inputs = Object.keys(node.bp.inputs).map(id => ({
                    id:+id,
                    amt: getInputAmt(node, +id, bpinfo),
                    amt_per_quantity: getInputAmt(node, +id, bpinfo) / node.quantity
                }));
            }
        }

        return node;
    };

    return fn(config?.output?.type?.id, config?.output?.quantity, null);
}

function getWaterfall(nodes: IndyNode[], settings: WaterfallSettings) {

    if(1 == 1) { return null; }

    const waterfall_nodes: {[typeid:number]:WaterfallInfo} = {};

    var i = 0;

    const isBuildable = (node: IndyNode) => !(
            node.src == "input" || node.src == "purchase" ||
            (node.src == "build" && node.bp.activity == Activity.planetary_interaction)
        );

    const getEnd = (node: IndyNode) => {
        const info = node?.typeid && waterfall_nodes[node.typeid];

        return info == null ? null : info.start + info.duration
    };

    const isFinished = (node: IndyNode, at_time: number) => {
        if(!isBuildable(node)) {
            return true;
        }

        const info = waterfall_nodes[node.typeid];

        if(info) {
            return info.start + info.duration <= at_time;
        } else {
            return false;
        }
    };

    const getBuildTime = (node: IndyNode) => {
        if(!isBuildable(node)) {
            return null;
        }

        return node.children
            .map(c => isBuildable(c) ? getEnd(c) : 0)
            .reduce((max, x) => x == null ? null : (x > max ? x : max), 0);
    };

    while(nodes.filter(n => isBuildable(n) && !waterfall_nodes[n.typeid])) {

        var next, next_time;

        for(const node of nodes) {
            if(getEnd(node) != null) {
                continue;
            }

            const time = getBuildTime(node);

            if(time != null) {
                next = node;
                next_time = time;
                break;
            }
        }

        if(!next) {
            throw new Error("Could not find next buildable node for waterfall, but there are unfinished nodes.");
        }

        const type = next.bp.activity == Activity.manufacturing || next.bp.activity == Activity.reaction ? "build" : "science";

        // const slot = 

        // const info: WaterfallInfo = {
        //     node: next,
        //     type: slot_type,

        // };

        if(i > 10000) {
            throw new Error("getWaterfall i > 10000. Potential infinite loop was terminated");
        }

        i++;
    }

    // return waterfall;
}

export function getIndustryResults(config: IndyConfig): IndyResult {

    if(config?.output?.type?.id == null) {
        return null;
    }

    const to_input = loadTypes(config.input_rules);
    const to_purchase = loadTypes(config.purchase_rules);
    const to_build = loadTypes(config.build_rules);

    const bpinfo: {[bpid:number]:BlueprintResearch} = {};

    return {
        config: config,
        summary: getSummary(config, to_input, to_purchase, to_build, bpinfo),
        graph: getGraph(config, to_input, to_purchase, to_build, bpinfo),
        waterfall: null,
        // waterfall: getWaterfall(encounter_order)
    };
}
