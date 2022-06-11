import { Meteor } from "meteor/meteor";
import { SessionProps } from "../imports/sessionProperties";

import "./storyImporter.html";

const importData = new ReactiveVar([]);
const importDataSelected = new ReactiveVar([]);

const IMPORT_ROW_LIMIT = 50;
const IMPORT_COLUMN_LIMIT = 10;
const IMPORT_CELL_LENGTH_LIMIT = 50;

export function handleData(data) {
    let storyInfos = [];
    let raw = data.getData("text/html");
    if (raw && raw.indexOf("<table") >= 0 && raw.indexOf("</table>") >= 0) {
        //parse a html table
        const rows = raw.split("</tr>");
        rows.slice(0, IMPORT_ROW_LIMIT).forEach((rowRaw) => {
            const cells = rowRaw.split("</td>");
            const storyParts = [];
            cells.slice(0, IMPORT_COLUMN_LIMIT).forEach((cellRaw) => {
                const txtMatch = cellRaw.match("<td[^>]*>(.*)");
                if (txtMatch) {
                    // we use the browser engine to clean up the html
                    const tmp = document.createElement("p");
                    tmp.innerHTML = txtMatch[1];
                    storyParts.push(tmp.textContent.trim());
                }
            });
            const storyInfo = storyParts.filter((part) => part);
            if (storyInfo.length > 0) {
                storyInfos.push(storyInfo);
            }
        });
    } else {
        // try plain text
        raw = data.getData("text/plain");
        storyInfos = raw
            .split("\n")
            .map((story) => {
                return story.replace("\r", "").replace("\t", " - ").substring(0, IMPORT_CELL_LENGTH_LIMIT).split(";");
            })
            .filter((storyInfo) => storyInfo.join().trim());
    }

    importData.set(storyInfos);
    const selected = {
        rows: [],
        cols: [],
    };
    for (let row = 0; row < storyInfos.length; row++) {
        selected.rows.push(row);
    }
    for (let col = 0; col < Math.min(2, storyInfos[0].length); col++) {
        selected.cols.push(col);
    }
    importDataSelected.set(selected);
}

Template.storyImporter.helpers({
    importData() {
        return importData.get();
    },
    firstData() {
        const firstRow = importData.get()[0];

        if (!firstRow || firstRow.length <= 1) {
            return [];
        }
        return importData.get()[0];
    },
    checkedRow(idx) {
        return importDataSelected.get().rows.includes(idx);
    },
    checkedCol(idx) {
        return importDataSelected.get().cols.includes(idx);
    },
});

Template.storyImporter.events({
    "change .importTable thead input"(evt) {
        const idx = parseInt(evt.target.dataset.idx);
        const data = importDataSelected.get();
        if ($(evt.target).prop("checked")) {
            data.cols.push(idx);
        } else {
            const foundAt = data.cols.indexOf(idx);
            data.cols = data.cols.slice(0, foundAt).concat(data.cols.slice(foundAt + 1));
        }
        importDataSelected.set(data);
    },
    "change .importTable tbody input"(evt) {
        const idx = parseInt(evt.target.dataset.idx);
        const data = importDataSelected.get();
        if ($(evt.target).prop("checked")) {
            data.rows.push(idx);
        } else {
            const foundAt = data.rows.indexOf(idx);
            data.rows = data.rows.slice(0, foundAt).concat(data.rows.slice(foundAt + 1));
        }
        importDataSelected.set(data);
    },
    "click #btn-import"() {
        const stories = [];
        const includedRows = importDataSelected.get().rows;
        const includedCols = importDataSelected.get().cols;
        importData
            .get()
            .filter((_, idx) => {
                return includedRows.includes(idx);
            })
            .forEach((row) => {
                stories.push(row.filter((_, idx) => includedCols.includes(idx)).join(" - "));
            });

        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        stories.forEach((story) =>
            Meteor.call("createStory", story, sessionId, (err) => {
                if (err) {
                    alert(err);
                }
            })
        );
    },
});
