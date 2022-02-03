
import * as m from "mithril";
import { Price } from "../../../util/format_utils";

interface PriceViewArgs {
    attrs: {
        price_rules;
        typeid: number;
        amt: number;
        default_price: "b"| "s";
        onPriceRulesChanged: (rules)=>void;
    };
};

export const PriceView = {
    view: ({ attrs: { price_rules, typeid, amt, default_price, onPriceRulesChanged } }: PriceViewArgs) => m("select", {
        onchange: evt => {
            price_rules[typeid] = evt.target.value;
            onPriceRulesChanged(price_rules);
        },
        onmousewheel: evt => {
            switch(Math.sign(evt.wheelDelta)) {
                case -1:
                case  1:
                    evt.preventDefault();
                    price_rules[typeid] = price_rules[typeid] == "b" ? "s" : "b";
                    onPriceRulesChanged(price_rules);
                default:
                    break;
            }
        },
        value: price_rules[typeid] || default_price
    }, [
        m("option", {value: "b"}, [
            Price(typeid, amt, "b"),
            " (Buy)",
        ]),
        m("option", {value: "s"}, [
            Price(typeid, amt, "s"),
            " (Sell)",
        ])
    ])
};
