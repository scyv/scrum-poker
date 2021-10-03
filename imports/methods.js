import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { uniqueNamesGenerator, adjectives, colors, animals, names, starWars } from "unique-names-generator";
import { Sessions, Stories } from "./collections";

Meteor.methods({
    createSession(name, owner) {
        check(name, String);
        check(owner, String);

        let id = "";
        do {
            id = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals, names],
                separator: "-",
                length: 4,
            })
                .toLowerCase()
                .replace(/^[a-z]/g, "");
        } while (Sessions.findOne({ _id: id }));

        return Sessions.insert({
            _id: id,
            timestamp: new Date(),
            name: name,
            owner: owner,
            perm_turnCards: true,
            perm_createStory: true,
            perm_setEstimate: true,
        });
    },
    setSessionOwner(sessionId, owner) {
        check(sessionId, String);
        check(owner, String);

        return Sessions.update(sessionId, { $set: { owner } });
    },
    chooseSessionType(type, sessionId) {
        check(type, String);
        check(sessionId, String);
        const safeSessionType = type === "fibonacci" ? type : "tshirt";
        return Sessions.update(sessionId, { $set: { type: safeSessionType } });
    },
    createStory(name, sessionId) {
        check(name, String);
        check(sessionId, String);

        if (!name) {
            name = uniqueNamesGenerator({
                dictionaries: [adjectives, animals],
                separator: " ",
                style: "capital",
                length: 2,
            });
        }

        const story = {
            name: name,
            timestamp: new Date(),
            sessionId: sessionId,
            participants: [],
        };

        return Stories.insert(story, (err, storyId) => {
            if (err) {
                console.err(err);
            }
        });
    },
    updateStory(storyObj, newName) {
        check(newName, String);
        check(storyObj._id, String);
        Stories.update(storyObj._id, { $set: { name: newName } });
    },
    deleteStory(storyObj) {
        check(storyObj._id, String);
        Stories.remove(storyObj._id);
    },
    setStory(sessionId, storyId) {
        check(sessionId, String);
        check(storyId, String);

        Sessions.update({ _id: sessionId }, { $set: { showStory: storyId } });
    },
    participate(name, storyId) {
        check(name, String);
        check(storyId, String);
        Stories.update(
            { _id: storyId },
            {
                $addToSet: {
                    participants: {
                        name: name,
                        ready: false,
                    },
                },
            }
        );
    },
    cancelParticipation(name, storyId) {
        check(name, String);
        check(storyId, String);
        Stories.update(
            { _id: storyId },
            {
                $pull: {
                    participants: {
                        name: name,
                    },
                },
            }
        );
    },
    estimateReady(name, storyId, value) {
        check(name, String);
        check(storyId, String);
        Stories.update(
            { _id: storyId, "participants.name": name },
            {
                $set: {
                    "participants.$.ready": true,
                    "participants.$.estimate": value,
                },
            }
        );
    },
    estimateNotReady(name, storyId) {
        check(name, String);
        check(storyId, String);
        Stories.update(
            { _id: storyId, "participants.name": name },
            {
                $set: { "participants.$.ready": false },
            }
        );
    },
    turnCards(storyId) {
        check(storyId, String);
        const story = Stories.findOne({ _id: storyId });
        Stories.update(
            { _id: storyId },
            {
                $set: { allVisible: !story.allVisible },
            }
        );
    },
    saveEstimate(storyId, estimate) {
        check(storyId, String);
        check(estimate, Number);
        Stories.update(
            { _id: storyId },
            {
                $set: { estimate: estimate },
            }
        );
        Sessions.update({ _id: Stories.findOne(storyId).sessionId }, { $set: { showStory: null } });
    },
    setPermission(permission, value, sessionId) {
        check(permission, String);
        check(sessionId, String);
        check(value, Boolean);
        const prop = "perm_" + permission;
        return Sessions.update(sessionId, JSON.parse('{ "$set": { "' + prop + '" : ' + value + " } }"));
    },
});
