import { IndyNode } from "../data/models/IndyConfig";
import { Pricing } from "../data/services/PriceService";

const ISK_FMT = new Intl.NumberFormat(navigator.language, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
});

export function pad(n, width, z='0') {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function FormatTime(seconds:number) {
    const s = Math.floor(seconds % 60),
          m = Math.floor(seconds / 60 % 60),
          h = Math.floor(seconds / 60 / 60 % 24),
          d = Math.floor(seconds / 60 / 60 / 24);

    if(d == 0) {
        return `${pad(Math.floor(h), 2)}:${pad(Math.floor(m), 2)}:${pad(Math.floor(s), 2)}`;
    } else {
        return `${d}D ${pad(Math.floor(h), 2)}:${pad(Math.floor(m), 2)}:${pad(Math.floor(s), 2)}`;
    }
}

export const getPrice = (price_rules, node: IndyNode) => {
    const ps = price_rules[node.typeid] || (node.src == "build" ? "s" : "b");
    const price = Pricing.getPrice(node.typeid);

    return price && (price[ps == "b" ? "buy" : "sell"] * node.quantity);
}

export const Price = (id:number, scale=1, type:"b"|"s"="s") => {
    const price = Pricing.getPrice(id);

    return price ? FormatPrice(price[type == "b" ? "buy" : "sell"] * scale) : "?";
}

export const Price2 = (price_rules, node: IndyNode) => {
    return FormatPrice(getPrice(price_rules, node));
}

export const FormatPrice = (isk:number) => {
    if(isk >= 1e12) {
        return `${(isk / 1e12).toFixed(3)}T`;
    }
    if(isk >= 1e9) {
        return `${(isk / 1e9).toFixed(3)}B`;
    }
    return ISK_FMT.format(isk).replace("US$", "");
}
