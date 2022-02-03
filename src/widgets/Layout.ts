import * as m from "mithril";
import { PriceFetcher } from "../data/services/PriceService";

import './Layout.scss';

export const Layout = {
    view: function(vnode: m.Vnode) {
        return m(".app-outer", [
            m(".app-inner", vnode.children),
            m(PriceFetcher)
        ]);
    }
};
