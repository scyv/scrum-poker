import { Mongo } from 'meteor/mongo';

/**
 * _id: the id
 * name: a name describing the session
 * stories[]: list of stories
 * currentStory: the story that is currently in progress
 */
Sessions = new Mongo.Collection("sessions");

/**
 * _id: the id
 * name: a name describing the story (e.g. ticket number)
 * result: resulting vote
 */
Stories = new Mongo.Collection("stories");

/**
 * _id: the id
 * storyPoints: the estimate story points
 * user: the estimating user
 */
Estimates = new Mongo.Collection("estimates");
