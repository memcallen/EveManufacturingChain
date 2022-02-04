
import * as m from "mithril";
import { map } from "lodash";

import './Table.scss';

export const Table = {
    view: ({ attrs: { title, headers, rows } }) => {
        return m(".table", {style: {"--columns": headers.length}}, [
            m(".table-title", {style: {"--columns": headers.length+1}}, title),

            map(headers, col => m(".table-header", col)),

            map(rows, row => map(row, cell => m(".table-cell", cell)))
        ]);
    }
};
