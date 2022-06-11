import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { uniqueNamesGenerator, adjectives, colors, animals, names } from "unique-names-generator";
import { Sessions, Stories } from "./collections";

Meteor.methods({
    createSession(name, owner, tryId) {
        check(name, String);
        check(
            owner,
            Match.Maybe({
                name: String,
                id: String,
            })
        );
        check(tryId, String);

        const normalize = (raw) => {
            return raw.toLowerCase().replace(/[^a-z-]+/gi, "-");
        };

        const nextId = () =>
            normalize(
                uniqueNamesGenerator({
                    dictionaries: [adjectives, colors, animals, names],
                    separator: "-",
                    length: 4,
                })
            );

        let id = tryId && tryId.length > 10 ? normalize(tryId) : nextId();
        while (Sessions.findOne({ _id: id })) {
            id = nextId();
        }

        return Sessions.insert({
            _id: id,
            timestamp: new Date(),
            name: name,
            owner: owner?.id,
            perm_turnCards: true,
            perm_createStory: true,
            perm_setEstimate: true,
        });
    },
    setSessionOwner(sessionId, owner) {
        check(sessionId, String);
        check(owner, {
            name: String,
            id: String,
        });

        return Sessions.update(sessionId, { $set: { owner: owner.id } });
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

        if (Stories.findOne({ name: name, sessionId: sessionId })) {
            return;
        }

        const story = {
            name: name,
            timestamp: new Date(),
            sessionId: sessionId,
            participants: [],
        };

        return Stories.insert(story, (err) => {
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
        Sessions.update({ _id: Stories.findOne(storyObj._id).sessionId }, { $set: { showStory: null } });
        Stories.remove(storyObj._id);
    },
    setStory(sessionId, storyId) {
        check(sessionId, String);
        check(storyId, String);

        let participantsFromPreviousStory = [];
        const session = Sessions.findOne({ _id: sessionId });
        if (session && session.previousStory) {
            const previousStory = Stories.findOne({ _id: session.previousStory });
            if (previousStory) {
                participantsFromPreviousStory = previousStory.participants
                    .filter((p) => p.ready)
                    .map((p) => ({
                        id: p.id,
                        name: p.name,
                        ready: false,
                    }));
            }
        }

        Sessions.update({ _id: sessionId }, { $set: { showStory: storyId, previousStory: storyId } });

        const story = Stories.findOne({ _id: storyId });
        if (!story.participants || story.participants.length === 0) {
            Stories.update(
                { _id: storyId },
                {
                    $set: {
                        participants: [...participantsFromPreviousStory],
                    },
                }
            );
        }
    },
    participate(participant, storyId) {
        check(participant, {
            name: String,
            id: String,
        });
        check(storyId, String);
        Stories.update(
            { _id: storyId },
            {
                $addToSet: {
                    participants: {
                        id: participant.id,
                        name: participant.name,
                        ready: false,
                    },
                },
            }
        );
    },
    cancelParticipation(participantId, storyId) {
        check(participantId, String);
        check(storyId, String);
        Stories.update(
            { _id: storyId },
            {
                $pull: {
                    participants: {
                        id: participantId,
                    },
                },
            }
        );
    },
    estimateReady(participant, storyId, value) {
        check(participant, {
            name: String,
            id: String,
        });
        check(storyId, String);
        Stories.update(
            { _id: storyId, "participants.id": participant.id },
            {
                $set: {
                    "participants.$.name": participant.name,
                    "participants.$.ready": true,
                    "participants.$.estimate": value,
                },
            }
        );
    },
    estimateNotReady(participantId, storyId) {
        check(participantId, String);
        check(storyId, String);
        Stories.update(
            { _id: storyId, "participants.id": participantId },
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
    changeUsername(participant) {
        check(participant, {
            name: String,
            id: String,
        });
        Stories.update(
            { "participants.id": participant.id },
            {
                $set: {
                    "participants.$.name": participant.name,
                },
            },
            { multi: true }
        );
    },
    cancelEstimate(sessionId) {
        check(sessionId, String);
        Sessions.update({ _id: sessionId }, { $set: { showStory: null } });
    },
});
