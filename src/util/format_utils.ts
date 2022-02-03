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
    var x = "";
    if(seconds >= 60*60*24) {
        x += `${Math.floor(seconds/60/60/24)}:`;
    }

    x += `${pad(Math.floor(seconds/60/60)%24, 2)}:${pad(Math.floor(seconds/60)%60, 2)}`;

    return x;
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

export const FormatPrice = (isk:number) => isk >= 1e9 ?
    isk && isk.toExponential(3) :
    isk && ISK_FMT.format(isk).replace("US$", "");
