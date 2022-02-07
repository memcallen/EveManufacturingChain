
import * as m from "mithril";
import { redirectTo } from "../";

import './Header.scss';
import { About } from "./pages/About/About";
import { IndySingleUnsaved } from "./pages/IndySingle/IndySingle";
import { IndySingleBrowser } from "./pages/IndySingleBrowser/IndySingleBrowser";

interface MenuItemArgs {
    attrs: {
        text: string;
        onclick?: ()=>void;
    };
    state: {
        open?: boolean;
    };
    children?: any;
};

const MenuItem = {
    view: ({ attrs: { text, onclick=()=>{} }, children } : MenuItemArgs) => {
        return m(".menu-item.btn.row", {
            onclick,
        }, [
            m("span.menu-item-label", text),

            children.length > 0 && m("span", "▼"),

            children.length > 0 && m(".menu-item-popup", [
                m(".menu-item-dropdown", [
                    ...children
                ])
            ])
        ]);
    }
};

const SubmenuItem = {
    view: ({ attrs: { text, onclick=()=>{} }, children } : MenuItemArgs) => {
        return m(".menu-item.btn.row", {
            onclick,
        }, [
            m("span.menu-item-label", text),

            children.length > 0 && m("span", "▶"),

            children.length > 0 && m(".menu-item-popup-side", [
                m(".menu-item-dropdown", [
                    ...children
                ])
            ])
        ]);
    }
}

export const Header = {
    view: () => {
        return m(".header.content-width-large", [
            m(".menu-item", {style: {cursor: "unset"}}, [
                m("span.menu-item-label", {style: {fontStyle: "italic"}}, "Eve Manufacturing Chain"),
            ]),

            m(MenuItem, {text: "Planner"}, [
                m(SubmenuItem, {text: "Browse Configs", onclick: () => {
                    redirectTo(IndySingleBrowser);
                }}),
                m(SubmenuItem, {text: "New", onclick: () => {
                    redirectTo(IndySingleUnsaved);
                }}),
            ]),

            m(MenuItem, {text: "About", onclick: () => {
                redirectTo(About);
            }})
        ]);
    }
};
