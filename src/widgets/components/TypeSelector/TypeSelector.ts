
import * as m from "mithril";
import { filter, map, toArray } from "lodash";

import "./TypeSelector.scss";
import { Modal } from "../Modal/Modal";
import { Type, TYPES } from "../../../data/type";
import { MarketGroup, MARKET_GROUPS, ROOT_MARKET_GROUPS } from "../../../data/market";

const MarketGroupRow = {
    view: ({ attrs: {   marketGroup, onToggleSelected, onDoubleClicked, isSelected, isSelectable,
                        onToggleExpanded, isExpanded }, children }: {attrs,children?}) => {
        return m(".mg", [
            m(".mg-row", [
                m("a.mg-row-expander", {onclick: onToggleExpanded}, isExpanded ? "▼" : "▶"),
                m(".mg-clicker", {onclick: isSelectable ? onToggleSelected : onToggleExpanded, ondblclick: onDoubleClicked}, [
                    m(".mg-label", marketGroup.name),
                    m(".gap"),
                    isSelectable ? m("input.mg-selector", {
                        type: "checkbox",
                        checked: isSelected ? "checked" : null
                    }) : null
                ])
            ]),

            isExpanded ? m(".mg-children", children) : null
        ]);
    }
};

const TypeRow = {
    view: ({ attrs: { type, onToggleSelected, onDoubleClicked, isSelected, isSelectable } }) => {
        return m(".ig", [
            m(".ig-row", {onclick: onToggleSelected, ondblclick: onDoubleClicked}, [
                m(".ig-label", type.name),
                m(".gap"),
                isSelectable ? m("input.ig-selector", {
                    type: "checkbox",
                    checked: isSelected ? "checked" : null
                }) : null
            ])
        ]);
    }
};

export class TypeSelector {
    private expanded: Set<number> = new Set<number>();
    private selected_groups: Set<number> = new Set<number>();
    private selected_types: Set<number> = new Set<number>();

    private onclose: ()=>void;
    private onsubmit: (types: number[], groups: number[])=>void;
    private multiple: boolean;
    private types_only: boolean;
    private inherit_selection: boolean;

    private search_text: string;
    private search_results: Type[];

    constructor({ attrs: {
            onclose = ()=>{},
            onsubmit = (types: number[], groups: number[])=>{},
            multiple = false,
            types_only = true,
            inherit_selection = true
    }}) {
        this.onclose = onclose;
        this.onsubmit = onsubmit;
        this.multiple = multiple;
        this.types_only = types_only;
        this.inherit_selection = inherit_selection;
        this.search_text = null;
        this.search_results = null;
    }

    toggleGroupSelected(group: MarketGroup) {
        if(this.types_only) {
            this.selected_groups.clear();
            return;
        }

        if(!this.selected_groups.has(group.id)) {
            if(!this.multiple) {
                this.selected_groups.clear();
                this.selected_types.clear();
            }

            this.selected_groups.add(group.id);
        } else {
            this.selected_groups.delete(group.id);
        }
        m.redraw();
    }

    toggleTypeSelected(type: Type) {
        if(!this.selected_types.has(type.id)) {
            if(!this.multiple) {
                this.selected_groups.clear();
                this.selected_types.clear();
            }

            this.selected_types.add(type.id);
        } else {
            this.selected_types.delete(type.id);
        }
    }

    toggleGroupExpanded(group: MarketGroup) {
        if(this.expanded.has(group.id)) {
            this.expanded.delete(group.id);
        } else {
            this.expanded.add(group.id);
        }
    }

    onGroupDoubleClicked(group: MarketGroup) {
        if(this.types_only) {
            this.toggleGroupExpanded(group);
        } else {
            this.onsubmit([], [group.id]);
        }
    }

    onTypeDoubleClicked(type: Type) {
        this.onsubmit([type.id], []);
    }

    do_search() {
        if(!this.search_text) {
            this.search_results = null;
        } else {
            const text = this.search_text.toLowerCase();
            this.search_results = filter(TYPES, type => type.name.toLowerCase().indexOf(text) > -1);
        }
    }

    view_mg_row(group: MarketGroup, parent_selected = false) {
        const isExpanded = this.expanded.has(group.id);
        const isSelected = this.inherit_selection ?
            parent_selected || this.selected_groups.has(group.id) :
            this.selected_groups.has(group.id);

        return m(MarketGroupRow, {
            marketGroup: group,
            onToggleSelected: () => this.toggleGroupSelected(group),
            onToggleExpanded: () => this.toggleGroupExpanded(group),
            onDoubleClicked: () => this.onGroupDoubleClicked(group),
            isExpanded: isExpanded,
            isSelected: isSelected,
            isSelectable: this.types_only ? false : true
        }, [
            isExpanded ? map(group.children, child => this.view_mg_row(MARKET_GROUPS[child], isSelected)) : null,

            map(group.types, tid => {
                const type = TYPES[tid];
                return m(TypeRow, {
                    type: type,
                    onToggleSelected: () => this.toggleTypeSelected(type),
                    onDoubleClicked: () => this.onTypeDoubleClicked(type),
                    isSelected: this.inherit_selection ? 
                            isSelected || this.selected_types.has(type.id) :
                            this.selected_types.has(type.id),
                    isSelectable: true
                });
            })
        ]);
    }

    view() {
        return m(Modal, {
            submitbtn: "Select",
            onclose: () => this.onclose(),
            onsubmit: () => this.onsubmit([...this.selected_types], [...this.selected_groups])
        }, [
            m(".typeselector-content", [

                m(".typeselector-search", [
                    m("input.typeselector-input", {
                        type: "text",
                        value: this.search_text,
                        placeholder: "Search",
                        oncreate: ({ dom }:{ dom:any }) => dom.focus(),
                        onkeyup: evt => {
                            this.search_text = evt.target.value;

                            if(evt.key == "Enter") {
                                this.do_search();
                            }
                        }
                    }),
                    m("input.typeselector-search-submit", {
                        type: "button",
                        value: "Search",
                        onclick: () => this.do_search()
                    })
                ]),

                this.search_results && m(".typeselector-groups", [
                    map(this.search_results, type => m(TypeRow, {
                        type: type,
                        onToggleSelected: () => this.toggleTypeSelected(type),
                        onDoubleClicked: () => this.onTypeDoubleClicked(type),
                        isSelected: this.selected_types.has(type.id),
                        isSelectable: true
                    }))
                ]),

                !this.search_results && m(".typeselector-groups", [
                    map(ROOT_MARKET_GROUPS, gid => this.view_mg_row(MARKET_GROUPS[gid]))
                ])
            ])
        ]);
    }

    [property: string]: any;
};
