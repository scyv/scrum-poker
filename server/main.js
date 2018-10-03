import { Meteor } from "meteor/meteor";
import {COLLECTIONS} from "../imports/collections";

import "../imports/methods";

Meteor.startup(() => {
    // code to run on server at startup
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
    const session = Sessions.findOne({_id: sessionId});
    if (session) {
        return Stories.find({_id: {$in: session.stories}});
    }
    return [];
});
