
import { find, map } from "lodash";
import * as m from "mithril";

import './TabView.scss';

export interface TabViewArgs {
    attrs: {
        default_tab?: string;
        onTabChanged?: (new_tab: string)=>void;
    }

    [key:string]:any;
};

export const TabView = {

    view(vnode: TabViewArgs) {
        const { attrs: { default_tab = null, onTabChanged = x=>{} }, children, state } = vnode;
        
        if(!find(children, ({ attrs: { tabname = "Unknown" } }) => tabname == state.active_tab)) {
            state.active_tab = default_tab;
            onTabChanged(state.active_tab);
        }

        if(state.active_tab == null && children.find(child => child.tabenabled)) {
            state.active_tab = children.find(child => child.tabenabled).attrs.tabname || "Unknown";
            onTabChanged(state.active_tab);
        }

        return m(".tab-view", [
            m(".tab-headers", [
                m(".gap"),
                map(children, ({ attrs: { tabname = "Unknown", tabenabled = true } }) => m(
                    "a.tab-header.btn" + (tabname == state.active_tab ? ".tab-header-active" : "")
                        + (tabenabled ? "" : ".btn-disabled"),
                    {
                        onclick: () => tabenabled && onTabChanged(state.active_tab = tabname)
                    },
                    tabname)),
                m(".gap")
            ]),
            
            find(children, ({ attrs: { tabname = "Unknown" } }) => tabname == state.active_tab || state.active_tab == null)
        ])
    }
};

interface TabArgs {
    attrs: {
        tabname: string;
        tabenabled?: boolean;
    };
    children?;
};

export const Tab = {
    view: ({ children }: TabArgs) => {
        return [...children];
    }
}
