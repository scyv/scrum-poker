import { Meteor } from "meteor/meteor";

const makeSnapshot = () => {
    const rawStories = Stories.rawCollection();
    const aggregate = Meteor.wrapAsync(rawStories.aggregate, rawStories);
    const storyPointSumResult = Promise.await(
        aggregate([
            {
                $group: {
                    _id: "totalSP",
                    sp: { $sum: "$estimate" },
                },
            },
        ]).toArray()
    );
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
};

Meteor.setInterval(makeSnapshot, 1000 * 60 * 60 * 24);
