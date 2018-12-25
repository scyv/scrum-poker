import { Meteor } from "meteor/meteor";
import {COLLECTIONS} from "../imports/collections";

import "../imports/methods";

Meteor.startup(() => {
    Sessions.find().forEach(sess => {
        if (sess.stories) {
            sess.stories.forEach(story => {
                console.log("Migrating story: " + story);
                Stories.update({_id: story}, {$set: {sessionId: sess._id}});
                Sessions.update({_id: sess._id}, {$set: {stories: null}});
            })
        }
    });
});

Meteor.publish(COLLECTIONS.SESSIONS, sessionId => {
    return Sessions.find({_id: sessionId});
});

Meteor.publish(COLLECTIONS.ESTIMATES, storyId => {
    const story = Stories.findOne({_id: storyId});
    if (story) {
        return Estimates.find({_id: {$in: story.estimates}});
    }
    return [];
});

Meteor.publish(COLLECTIONS.STORIES, sessionId => {
    return Stories.find({sessionId: sessionId});
});
