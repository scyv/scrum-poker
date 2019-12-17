import { Mongo } from 'meteor/mongo';

export const COLLECTIONS = {
    SESSIONS: "sessions",
    STORIES: "stories",
    STATISTICS: "statistics"
};

/**
 * _id: the id
 * name: a name describing the session
 * stories[]: list of stories
 * currentStory: the story that is currently in progress
 */
Sessions = new Mongo.Collection(COLLECTIONS.SESSIONS);

/**
 * _id: the id
 * name: a name describing the story (e.g. ticket number)
 * result: resulting vote
 * estimates[]: list of estimates
 */
Stories = new Mongo.Collection(COLLECTIONS.STORIES);


/**
 * _id: the id
 * sessionCount: Number of sessions
 * storyCount: Number of stories,
 * storyPoints: Sum of Storypoints
 *
 */
Statistics = new Mongo.Collection(COLLECTIONS.STATISTICS);
