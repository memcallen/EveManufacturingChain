
import * as m from "mithril";
import { Activity, Blueprint } from "../blueprints";
import { IndyNode } from "../models/IndyConfig";
import { TYPES } from "../type";

interface ESIIndexResponse {
    cost_indices: {
        activity: "manufacturing" | "researching_time_efficiency" | "researching_material_efficiency" | "copying" | "invention" | "reaction";
        cost_index: number;
    }[];
    solar_system_id: number;
};

export interface SystemCostIndex {
    manufacturing: number;
    researching_time_efficiency: number;
    researching_material_efficiency: number;
    copying: number;
    invention: number;
    reaction: number;
};

const extract = (r: ESIIndexResponse, key: string) => ({
    [key]: r.cost_indices.find(e => e.activity == key)?.cost_index
});

export const CostIndices = {

    url: "https://esi.evetech.net/latest/industry/systems/?datasource=tranquility",

    data: {} as {[system:number]: SystemCostIndex},

    fetch: async () => {
        const resp = await m.request<ESIIndexResponse[]>({
            url: CostIndices.url,
            method: "GET"
        });

        const data = {};

        resp.forEach(r => data[r.solar_system_id] = {
            ...extract(r, "manufacturing"),
            ...extract(r, "researching_time_efficiency"),
            ...extract(r, "researching_material_efficiency"),
            ...extract(r, "copying"),
            ...extract(r, "invention"),
            ...extract(r, "reaction"),
        });

        CostIndices.data = data;
    },

    getCost: (system: number): SystemCostIndex => {
        return CostIndices.data[system] || null;
    },

    getActivityCost: (system: number, activity: Activity): number | null => {
        const idx = CostIndices.data[system] || null;

        return idx ? ({
            [Activity.manufacturing]: idx.manufacturing,
            [Activity.research_time]: idx.researching_time_efficiency,
            [Activity.research_material]: idx.researching_material_efficiency,
            [Activity.copying]: idx.copying,
            [Activity.invention]: idx.invention,
            [Activity.reaction]: idx.reaction
        }[activity]) : null;
    },

    getInstallationCost: (system: number, node: IndyNode) => {
        if(node.bp.activity == Activity.manufacturing) {
            return TYPES[node.typeid].base_price * node.quantity * CostIndices.getActivityCost(system, Activity.manufacturing);
        } else {
            return 0;
        }
    },
};

CostIndices.fetch();
