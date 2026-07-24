import { Meteor } from "meteor/meteor";
import { Stories, Sessions, Statistics } from "../imports/collections";

const makeSnapshot = async () => {
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
    if (storyPointSumResult[0]) {
        const oldStat = undefined;
        const sessionOffset = oldStat?.sessionCount ?? 0;
        const storyCountOffset = oldStat?.storyCount ?? 0;
        const storyPointsOffset = oldStat?.storyPoints ?? 0;
        await Statistics.insertAsync({
            timestamp: new Date(),
            sessionCount: sessionOffset + await Sessions.find().countAsync(),
            storyCount: storyCountOffset + await Stories.find().countAsync(),
            storyPoints: storyPointsOffset + storyPointSumResult[0].sp,
        });
    }
    Meteor.setTimeout(makeSnapshot, 1000 * 60 * 60 * 24);
};

makeSnapshot();
