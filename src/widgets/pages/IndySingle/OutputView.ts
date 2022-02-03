
import * as m from "mithril";
import { IndyOutput } from "../../../data/models/IndyConfig";
import { TYPES } from "../../../data/type";
import { TypeIcon } from "../../components/itemicon";
import { TypeSelector } from "../../components/TypeSelector/TypeSelector";

import './OutputView.scss';

interface OutputViewArgs {
    state: {
        selector_visible?: boolean;
    };
    attrs: {
        output: IndyOutput,
        onOutputChanged: (output:IndyOutput)=>void;
    };
};

export const OutputView = {
    view: ({ attrs: { output, onOutputChanged }, state }: OutputViewArgs) => {
        return m(".output-view.column", [
            m(".row", [
                m(".output-view-img", [output?.type && m(TypeIcon, {id: output.type.id})]),
                m(".output-view-name", output?.type?.name || "No Output Selected")
            ]),
            
            m(".row.output-view-edit", [
                m("input.output-view-change", {
                    type: "button",
                    value: "Select Output",
                    onclick: () => {
                        state.selector_visible = true;
                    }
                }),
                m("input.output-view-amount", {
                    type: "number",
                    value: output?.quantity || 0,
                    placeholder: "Quantity",
                    onchange: evt => {
                        onOutputChanged({
                            ...output,
                            quantity: +evt.target.value
                        });
                    },
                    onmousewheel: evt => {
                        evt.preventDefault();
                        
                        if(evt.wheelDelta < 0) {
                            onOutputChanged({
                                ...output,
                                quantity: output.quantity <= 1 ? 0 : output.quantity - 1
                            });
                        } else if(evt.wheelDelta > 0) {
                            onOutputChanged({
                                ...output,
                                quantity: output.quantity + 1
                            });
                        }
                    }
                }),
            ]),

            state.selector_visible && m("div", m(TypeSelector, {
                multiple: false,
                types_only: true,
                inherit_selection: false,

                onclose: () => state.selector_visible = false,
                onsubmit: (types: number[]) => {
                    state.selector_visible = false;
                    const type = TYPES[types[0]];
                    onOutputChanged({
                        ...output,
                        type
                    });
                }
            }))
        ]);
    }
};
