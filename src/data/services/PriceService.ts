import { chunk } from "lodash";
import * as m from "mithril";
import { Type } from "../type";

interface PriceFetcher {
    readonly maxPerFetch: number;

    fetch(typeids:number[]): Promise<{[id:number]:TypePricing}>;
};

export interface TypePricing {
    sell: number;
    buy: number;
    retrieved: Date;
    typeid: number;
};

export class PriceService {

    private queued: Set<number> = new Set();
    private fetching: Set<number> = new Set();
    private prices: {[id:number]:TypePricing} = {};

    private timeout = 60 * 60 * 1000;

    constructor() {
        this.load();
    }

    getPrice(typeid:number): TypePricing|null {
        const price = this.prices[typeid] || null;

        if(price && price.retrieved && new Date().getTime() <= price.retrieved?.getTime() + this.timeout) {
            return price;
        }

        if(this.fetching.has(typeid)) {
            return price;
        }

        this.queued.add(typeid);

        return price;
    }

    fetchQueued() {
        const fetcher: PriceFetcher = evemarketer_fetcher;

        const tofetch = [...this.queued];
        tofetch.forEach(id => this.fetching.add(id));
        this.queued.clear();

        if(tofetch.length == 0) {
            return;
        }

        const promises = chunk(tofetch, fetcher.maxPerFetch).map(ids => fetcher.fetch(ids).then(prices => {
            for(var _id in prices) {
                const id = +_id;
                this.prices[id] = prices[id];
                this.fetching.delete(id);
            }
        }));

        const finish = async () => {
            for(var promise of promises) {
                await promise;
            }

            m.redraw();

            localStorage.setItem("pricing", JSON.stringify(this.prices));
        };

        finish();
    }

    load() {
        const data = localStorage.getItem("pricing");
        if(data) {
            try {
                this.prices = JSON.parse(data, (key, value) => key == "retrieved" ? new Date(value) : value);
            } catch {}
        }
    }

    clear() {
        this.queued = new Set();
        this.fetching = new Set();
        this.prices = {};
    }
};

const evemarketer_fetcher: PriceFetcher = {
    maxPerFetch: 200,

    fetch: async (ids) => {
        const data: any[] = await m.request({
            method: "GET",
            url: "https://api.evemarketer.com/ec/marketstat/json",
            params: {
                "typeid": [...ids].sort((a, b) => a - b).map(id => id + "").join(",")
            }
        });

        const prices: {[id:number]:TypePricing} = {};

        const date = new Date();

        data.forEach(({buy, sell}) => {
            prices[buy.forQuery.types[0]] = {
                buy: buy.fivePercent,
                sell: sell.fivePercent,
                retrieved: date,
                typeid: buy.forQuery.types[0]
            };
        });

        return prices;
    }
};

export const Pricing = new PriceService();

export const PriceFetcher = {
    view: () => {
        setTimeout(() => Pricing.fetchQueued(), 0);

        return null;
    }
};
