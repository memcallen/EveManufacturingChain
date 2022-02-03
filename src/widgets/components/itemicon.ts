
import * as m from "mithril";

export interface Args {
    attrs: {
        id: number,
        type?: "render" | "icon" | "bp" | "bpc";
        size?: 32 | 64 | 128 | 256 | 512 | 1024;
    };
};

export const TypeIcon = {
    view: ({ attrs: {id, type = "icon", size = null} }: Args) => {
        return m("img", {
            style: {
                "user-select": "none"
            },
            src: `https://images.evetech.net/types/${id}/${type}?&tenant=singularity` + 
                (size ? `&size=${size}` : "")
        });
    }
};
