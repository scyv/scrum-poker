import { Meteor } from "meteor/meteor";
import { Stories, Sessions, Statistics } from "../imports/collections";

const makeSnapshot = () => {
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
    if (storyPointSumResult[0]) {
        const oldStat = undefined; //Statistics.findOne({}, { sort: { timestamp: -1 } });
        const sessionOffset = oldStat?.sessionCount ?? 0;
        const storyCountOffset = oldStat?.storyCount ?? 0;
        const storyPointsOffset = oldStat?.storyPoints ?? 0;
        Statistics.insert({
            timestamp: new Date(),
            sessionCount: sessionOffset + Sessions.find().count(),
            storyCount: storyCountOffset + Stories.find().count(),
            storyPoints: storyPointsOffset + storyPointSumResult[0].sp,
        });
    }
    Meteor.setTimeout(makeSnapshot, 1000 * 60 * 60 * 24);
};

makeSnapshot();
