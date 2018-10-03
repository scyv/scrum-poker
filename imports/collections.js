import { Mongo } from 'meteor/mongo';

export const COLLECTIONS = {
    SESSIONS: "sessions",
    STORIES: "stories",
    ESTIMATES: "estimates"
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
 * storyPoints: the estimate story points
 * user: the estimating user
 */
Estimates = new Mongo.Collection(COLLECTIONS.ESTIMATES);

