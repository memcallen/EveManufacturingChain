
import { map } from "lodash";
import * as m from "mithril";

import './PopupMenu.scss';

const Menu = {
    view: ({ attrs: { label, value, close, data } }: any) => {
        return m(".popup-menu-menu", {
            onclick: typeof(value) == "function" ? () => {
                value(data);
                close();
            } : null
        }, [
            m(".popup-menu-label", [
                m(".popup-menu-label-text", label),
                m(".gap"),
                typeof(value) == "object" ? m(".popup-menu-arrow", "▶") : null
            ]),
            
            typeof(value) == "object" ? 
                m(".popup-menu-submenu", map(Object.entries(value), ([label, value]) => m(Menu, {label, value, close, data}))) :
                null
        ]);
    }
};

export const PopupMenu = {
    oninit: ({ attrs: { hooks = null }, state }: any) => {
        if(hooks) {
            hooks({
                showPopupMenu: (x=null, y=null, data=null) => {
                    state.visible = true;
                    state.x = x;
                    state.y = y;
                    state.data = data;
                },
        
                hidePopupMenu: () => {
                    state.visible = false;
                    state.x = null;
                    state.y = null;
                    state.data = null;
                },
            });
        }
    },

    view: ({ attrs: { x = null, y = null, menu = {} }, state }: any) => {
        if(state.visible && !state.prev_visible) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
            state.scroll_evt_listener = () => {
                window.scrollTo(scrollLeft, scrollTop);
            }
    
            document.addEventListener("scroll", state.scroll_evt_listener);
        }

        if(!state.visible && state.prev_visible) {
            document.removeEventListener("scroll", state.scroll_evt_listener);
        }

        state.prev_visible = state.visible;

        const close = () => state.visible = false;

        if(typeof(menu) == "function") {
            menu = menu(state.data);
        }

        return state.visible ? m(".popup-outer", {onclick: close}, [
            m(".popup-menu", {
                style: {
                    "--x": (x || state.x || 0) + "px",
                    "--y": (y || state.y || 0) + "px"
                }
            }, [
                map(Object.entries(menu), ([label, value]) => m(Menu, {label, value, close, data: state.data}))
            ])
        ]) : null;
    }
};

export function PopupMenuHooks() {
    var _showPopupMenu, _hidePopupMenu;

    return {
        showPopupMenu: (x=null, y=null, data=null) => _showPopupMenu(x, y, data),
        hidePopupMenu: () => _hidePopupMenu(),
        PopupMenu: () => {
            return {
                view: vnode => m(PopupMenu, Object.assign({}, vnode.attrs, {
                    hooks: ({showPopupMenu, hidePopupMenu}) => {
                        _showPopupMenu = showPopupMenu;
                        _hidePopupMenu = hidePopupMenu;
                    }
                }), vnode.children)
            };
        }
    };
}
