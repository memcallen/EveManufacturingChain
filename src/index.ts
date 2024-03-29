
import * as m from "mithril";
import { getQueryString } from "./util/hash";

import { Layout } from "./widgets/Layout";

import { IndySingleId, IndySingleShare, IndySingleUnsaved } from "./widgets/pages/IndySingle/IndySingle";
import { IndySingleBrowser } from "./widgets/pages/IndySingleBrowser/IndySingleBrowser";
import { About } from "./widgets/pages/About/About";

import './index.css';
import './dark-theme.css';
import './index.html';

const Redirector = (page: m.ComponentTypes, params?: {[key:string]:string}, qparams?: {[key:string]:string}) =>  {
    return {
        view: () => {
            redirectTo(page, params, qparams);
            return null;
        }
    };
}

const routes: [string, m.ComponentTypes][] = [
    ["/", Redirector(IndySingleUnsaved)],
    ["/planner/new", IndySingleUnsaved],
    ["/planner/saved/:id", IndySingleId],
    ["/planner/share", IndySingleShare],
    ["/planner/browse", IndySingleBrowser],

    ["/about", About],
];

const routes_dict = {};

routes.forEach(([route, component]) => routes_dict[route] = {
    render: ({ attrs }) => {
        return m(Layout, m(component, attrs));
    },
    onmatch: (...args) => {
        if(typeof component["onmatch"] !== "undefined") {
            component["onmatch"](...args);
        }
    }
});

export const getRedirectHash = (page: m.ComponentTypes, params?: {[key:string]:any}, qparams?: {[key:string]:any}) => {
    for(var [url, comp] of routes) {
        if(page == comp) {
            return "#!" + m.buildPathname(url, params) + getQueryString(qparams || {});
        }
    }
}

export const redirectTo = (page: m.ComponentTypes, params?: {[key:string]:string}, qparams?: {[key:string]:string}) => {
    const hash = getRedirectHash(page, params, qparams);

    if(hash) {
        window.location.hash = hash;
        return true;
    } else {
        return false;
    }
};

m.route(document.body, "/", routes_dict);
