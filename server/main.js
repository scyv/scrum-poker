import { Meteor } from "meteor/meteor";
import { COLLECTIONS, Features, Sessions, Statistics, Stories } from "../imports/collections";
import * as Excel from "node-excel-export";
import "../imports/methods";
import "./statistics";
import { TSHIRT } from "../imports/cards";

Meteor.startup(() => {
    console.log("Ready for e-business.");

    Features.upsert(
        { _id: "drop-list" },
        { since: "2022-06-12T00:00:00Z", title: "features.drop-list", text: "features.drop-list-text" }
    );

    Features.upsert(
        { _id: "navigate-back-and-forth" },
        {
            since: "2022-06-11T00:00:00Z",
            title: "features.navigate-back-and-forth",
            text: "features.navigate-back-and-forth-text",
        }
    );
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

Meteor.publish(COLLECTIONS.LIVE_STATISTICS, function () {
    const publishedKeys = {};

    const poll = () => {
        const rawStories = Stories.rawCollection();

        const cursor = rawStories.aggregate([
            {
                $group: {
                    _id: "totalSP",
                    sp: { $sum: "$estimate" },
                },
            },
        ]);
        const storyPointSumResult = Meteor.wrapAsync(cursor.toArray, cursor)();

        if (!storyPointSumResult[0]) {
            return;
        }
        const data = [
            {
                _id: "singleDoc",
                sessionCount: Sessions.find().count(),
                storyCount: Stories.find().count(),
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

    poll();
    this.ready();

    const interval = Meteor.setInterval(poll, 60000);

    this.onStop(() => {
        Meteor.clearInterval(interval);
    });
});

Router.route(
    "/session/download/:sessionId",
    function () {
        const styles = {
            header: {
                fill: {
                    fgColor: {
                        rgb: "FFFFFFFF",
                    },
                },
                font: {
                    color: {
                        rgb: "FF000000",
                    },
                    bold: true,
                    underline: false,
                },
            },
        };

        const specification = {
            name: {
                displayName: "Name",
                width: "50",
                headerStyle: styles.header,
            },
            estimate: {
                displayName: "Schätzung",
                width: "10",
                headerStyle: styles.header,
            },
        };

        const session = Sessions.findOne(this.params.sessionId);
        let dataset = Stories.find(
            { sessionId: this.params.sessionId },
            {
                fields: {
                    name: 1,
                    estimate: 1,
                },
            }
        ).fetch();
        if (session.type === "tshirt") {
            cards = TSHIRT;
            dataset = dataset.map((story) => {
                story.estimate = cards["SP" + story.estimate]?.displayValue ?? "-";
                return story;
            });
        }

        const report = Excel.buildExport([
            {
                name: session.name,
                specification: specification,
                data: dataset,
            },
        ]);

        const headers = {
            "Content-type": "application/vnd.openxmlformats",
            "Content-Disposition": "attachment; filename=Stories.xlsx",
        };
        this.response.writeHead(200, headers);
        this.response.end(report, "binary");
    },
    { where: "server" }
);
