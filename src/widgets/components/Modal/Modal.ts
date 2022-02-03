
import * as m from "mithril";
import "./Modal.scss";

export class Modal {

    private closebtn: boolean;
    private submitbtn: string | null;
    private onclose: ()=>void;
    private onsubmit: ()=>void;
    private title: string | null;
    private chview;

    private esc_evt_listener;

    constructor({ attrs: { closebtn = true, submitbtn = null, onclose = ()=>{}, onsubmit = ()=>{}, title = null, view = null } }) {
        this.closebtn = closebtn;
        this.submitbtn = submitbtn;
        this.onclose = onclose;
        this.onsubmit = onsubmit;
        this.title = title;
        this.chview = view;
    }

    oncreate() {
        this.esc_evt_listener = evt => {
            if(evt.key == "Escape") {
                this.onclose();
                m.redraw();
            }
        }

        document.addEventListener("keyup", this.esc_evt_listener);
    }

    onremove() {
        document.removeEventListener("keyup", this.esc_evt_listener);
    }

    view({ children }:{children?}) {
        return m(".modal-background", {
            onclick: evt => {
                if(evt.target.classList.contains("modal-background")) {
                    this.onclose();
                }
            }
        }, [m(".modal", [

            m("div", [
                this.title,
                m(".gap"),
                this.closebtn ? m("a.btn.modal-close", {
                    onclick: () => this.onclose()
                }, "✕") : null
            ]),

            this.chview ? m({view: this.chview}) : null,

            m("div", children),

            this.submitbtn ? [
                m(".gap"),
                m("div", [
                    m(".gap"),
                    m("a.btn.modal-submit", {
                        onclick: () => this.onsubmit()
                    }, this.submitbtn)
                ])
            ] : null
        ])]);
    }

    [property: string]: any;
}
