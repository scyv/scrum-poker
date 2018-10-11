import { Meteor } from 'meteor/meteor'
import { check } from "meteor/check";


Meteor.methods({
    createSession(name, owner) {
        check(name, String);
        check(owner, String);

        return Sessions.insert({name: name, owner: owner});
    },
    createStory(name, sessionId) {
        check(name, String);
        check(sessionId, String);

        const story = {
            name: name,
            result: undefined,
            participants: []
        };

        return Stories.insert(story, (err, storyId)=> {
            if (err) {
                console.err(err);
            } else {
                const session = Sessions.findOne({_id: sessionId});
                if (session) {
                    Sessions.update({_id: sessionId}, {$addToSet: {stories: storyId}});
                }
            }
        });
    },
    setStory(sessionId, storyId) {
        check(sessionId, String);
        check(storyId, String);

        Sessions.update({_id: sessionId}, {$set: {showStory: storyId}});
    },
    participate(name, storyId) {
        check(name, String);
        check(storyId, String);
        Stories.update({_id: storyId}, {
            $addToSet: {
                participants: {
                    name: name,
                    ready: false
                }
            }
        });
    },
    cancelParticipation(name, storyId) {
        check(name, String);
        check(storyId, String);
        Stories.update({_id: storyId}, {
            $pull: {
                participants: {
                    name: name
                }
            }
        });
    },
    estimateReady(name, storyId, value) {
        check(name, String);
        check(storyId, String);
        Stories.update({_id: storyId, "participants.name": name}, {
            $set: {
                "participants.$.ready": true,
                "participants.$.estimate": value
            },
        });
    },
    estimateNotReady(name, storyId) {
        check(name, String);
        check(storyId, String);
        Stories.update({_id: storyId, "participants.name": name}, {
            $set: {"participants.$.ready": false}
        });
    },
    turnCards(storyId) {
        check(storyId, String);
        const story = Stories.findOne({_id: storyId});
        Stories.update({_id: storyId}, {
            $set: {"allVisible": !story.allVisible}
        });
    },
    saveEstimate(storyId, estimate) {
        check(storyId, String);
        check(estimate, Number);
        Stories.update({_id: storyId}, {
            $set: {"estimate": estimate}
        });
    }
});