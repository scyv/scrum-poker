import { Mongo } from "meteor/mongo";

export const COLLECTIONS = {
    SESSIONS: "sessions",
    STORIES: "stories",
    STATISTICS: "statistics",
    LIVE_STATISTICS: "liveStatistics",
    FEATURES: "features",
};

/**
 * _id: the id
 * name: a name describing the session
 * stories[]: list of stories
 * currentStory: the story that is currently in progress
 */
export const Sessions = new Mongo.Collection(COLLECTIONS.SESSIONS);

/**
 * _id: the id
 * name: a name describing the story (e.g. ticket number)
 * result: resulting vote
 * estimates[]: list of estimates
 */
export const Stories = new Mongo.Collection(COLLECTIONS.STORIES);

/**
 * _id: id
 * title: string
 */
export const Features = new Mongo.Collection(COLLECTIONS.FEATURES);

/**
 * _id: the id
 * sessionCount: Number of sessions
 * storyCount: Number of stories,
 * storyPoints: Sum of Storypoints
 *
 */
export const Statistics = new Mongo.Collection(COLLECTIONS.STATISTICS);
export const LiveStatistics = new Mongo.Collection(COLLECTIONS.LIVE_STATISTICS);
