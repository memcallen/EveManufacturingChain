
import { map } from "lodash";
import * as m from "mithril";

import './Accordion.scss';

class AccordionFold {

    private collapsed: boolean = true;
    private label: string;

    constructor({ attrs: { label } }) {
        this.label = label;
    }

    view({ children }: { children? }) {
        return m(".accordion-fold", [
            m(".accordion-header.row", {onclick:()=> this.collapsed = !this.collapsed}, [
                m(".accordion-arrow", this.collapsed ? "▶" : "▼"),
                this.label
            ]),

            m(this.collapsed ? ".accordion-collapsed" : ".accordion-open", children)
        ]);
    }

    [property: string]: any;
};

export const Accordion = {
    view({ children }: { children? }) {
        return m(".accordion-outer", map(children, (child) => {
            return m(AccordionFold, {label: child.key, key: child.key}, [child]);
        }));
    }
};
