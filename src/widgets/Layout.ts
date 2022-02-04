import * as m from "mithril";
import { PriceFetcher } from "../data/services/PriceService";
import { Header } from "./Header";

import './Layout.scss';

export const Layout = {
    view: function(vnode: m.Vnode) {
        return m(".app-outer", [
            m(Header),
            m(".app-inner", vnode.children),
            m(PriceFetcher)
        ]);
    }
};
