import { Meteor } from "meteor/meteor";
import { COLLECTIONS, Features, Sessions, Statistics, Stories } from "../imports/collections";
import ExcelJS from "exceljs";
import "../imports/methods";
import "./statistics";
import { TSHIRT } from "../imports/cards";

Meteor.startup(async () => {
    await Features.upsertAsync(
        { _id: "type-vote" },
        { $set: { since: "2022-07-19T00:00:00Z", title: "features.type-vote", text: "features.type-vote-text" } }
    );

    console.log("Ready for e-business.");
});

Meteor.publish(COLLECTIONS.SESSIONS, function (sessionId) {
    return Sessions.find({ _id: sessionId });
});

Meteor.publish(COLLECTIONS.STORIES, function (sessionId) {
    return Stories.find({ sessionId: sessionId });
});
Meteor.publish(COLLECTIONS.STATISTICS, function () {
    return Statistics.find({});
});
Meteor.publish(COLLECTIONS.FEATURES, function () {
    return Features.find({}, { sort: { since: -1 } });
});

Meteor.publish(COLLECTIONS.LIVE_STATISTICS, async function () {
    const publishedKeys = {};

    const poll = async () => {
        const rawStories = Stories.rawCollection();

        const cursor = rawStories.aggregate([
            {
                $group: {
                    _id: "totalSP",
                    sp: { $sum: "$estimate" },
                },
            },
        ]);
        const storyPointSumResult = await cursor.toArray();

        if (!storyPointSumResult[0]) {
            return;
        }
        const data = [
            {
                _id: "singleDoc",
                sessionCount: await Sessions.find().countAsync(),
                storyCount: await Stories.find().countAsync(),
                storyPoints: storyPointSumResult[0].sp,
            },
        ];

        data.forEach((doc) => {
            if (publishedKeys[doc._id]) {
                this.changed(COLLECTIONS.LIVE_STATISTICS, doc._id, doc);
            } else {
                publishedKeys[doc._id] = true;
                this.added(COLLECTIONS.LIVE_STATISTICS, doc._id, doc);
            }
        });
    };

    await poll();
    this.ready();

    const interval = Meteor.setInterval(() => poll(), 60000);

    this.onStop(() => {
        Meteor.clearInterval(interval);
    });
});

Router.route(
    "/session/download/:sessionId",
    async function () {
        const session = await Sessions.findOneAsync(this.params.sessionId);

        let dataset = await Stories.find(
            { sessionId: this.params.sessionId },
            {
                fields: {
                    name: 1,
                    estimate: 1,
                },
            }
        ).fetchAsync();
        if (session.type === "tshirt") {
            const cards = TSHIRT;
            dataset = dataset.map((story) => {
                story.estimate = cards["SP" + story.estimate]?.displayValue ?? "-";
                return story;
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(session.name);

        worksheet.columns = [
            { header: "Name", key: "name", width: 50 },
            {
                header: session.type === "vote" ? "Bewertung" : "Schätzung",
                key: "estimate",
                width: 10,
            },
        ];

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FF000000" } };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFFFF" },
        };

        dataset.forEach((story) => worksheet.addRow(story));

        const buffer = await workbook.xlsx.writeBuffer();

        const headers = {
            "Content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=Stories.xlsx",
        };
        this.response.writeHead(200, headers);
        this.response.end(buffer);
    },
    { where: "server" }
);
