import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { uniqueNamesGenerator, adjectives, colors, animals, names } from "unique-names-generator";
import { Sessions, Stories } from "./collections";

Meteor.methods({
    async createSession(name, owner, tryId) {
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
        while (await Sessions.findOneAsync({ _id: id })) {
            id = nextId();
        }

        return await Sessions.insertAsync({
            _id: id,
            timestamp: new Date(),
            name: name,
            owner: owner?.id,
            perm_turnCards: true,
            perm_createStory: true,
            perm_setEstimate: true,
        });
    },
    async setSessionOwner(sessionId, owner) {
        check(sessionId, String);
        check(owner, {
            name: String,
            id: String,
        });

        return await Sessions.updateAsync(sessionId, { $set: { owner: owner.id } });
    },
    async chooseSessionType(type, sessionId) {
        check(type, String);
        check(sessionId, String);

        let safeSessionType = "fibonacci";
        switch (type) {
            case "tshirt":
                safeSessionType = "tshirt";
                break;
            case "vote":
                safeSessionType = "vote";
                break;
        }
        return await Sessions.updateAsync(sessionId, { $set: { type: safeSessionType } });
    },
    async createStory(name, sessionId) {
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

        if (await Stories.findOneAsync({ name: name, sessionId: sessionId })) {
            return;
        }

        const story = {
            name: name,
            timestamp: new Date(),
            sessionId: sessionId,
            participants: [],
        };

        return await Stories.insertAsync(story);
    },
    async updateStory(storyObj, newName) {
        check(newName, String);
        check(storyObj._id, String);
        await Stories.updateAsync(storyObj._id, { $set: { name: newName } });
    },
    async deleteStory(storyObj) {
        check(storyObj._id, String);
        const story = await Stories.findOneAsync(storyObj._id);
        await Sessions.updateAsync({ _id: story.sessionId }, { $set: { showStory: null } });
        await Stories.removeAsync(storyObj._id);
    },
    async setStory(sessionId, storyId) {
        check(sessionId, String);
        check(storyId, String);

        let participantsFromPreviousStory = [];
        const session = await Sessions.findOneAsync({ _id: sessionId });
        if (session && session.previousStory) {
            const previousStory = await Stories.findOneAsync({ _id: session.previousStory });
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

        await Sessions.updateAsync({ _id: sessionId }, { $set: { showStory: storyId, previousStory: storyId } });

        const story = await Stories.findOneAsync({ _id: storyId });
        if (!story.participants || story.participants.length === 0) {
            await Stories.updateAsync(
                { _id: storyId },
                {
                    $set: {
                        participants: [...participantsFromPreviousStory],
                    },
                }
            );
        }
    },
    async participate(participant, storyId) {
        check(participant, {
            name: String,
            id: String,
        });
        check(storyId, String);
        await Stories.updateAsync(
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
    async cancelParticipation(participantId, storyId) {
        check(participantId, String);
        check(storyId, String);
        await Stories.updateAsync(
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
    async estimateReady(participant, storyId, value) {
        check(participant, {
            name: String,
            id: String,
        });
        check(storyId, String);
        await Stories.updateAsync(
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
    async estimateNotReady(participantId, storyId) {
        check(participantId, String);
        check(storyId, String);
        await Stories.updateAsync(
            { _id: storyId, "participants.id": participantId },
            {
                $set: { "participants.$.ready": false },
            }
        );
    },
    async turnCards(storyId) {
        check(storyId, String);
        const story = await Stories.findOneAsync({ _id: storyId });
        await Stories.updateAsync(
            { _id: storyId },
            {
                $set: { allVisible: !story.allVisible },
            }
        );
    },
    async saveEstimate(storyId, estimate) {
        check(storyId, String);
        check(estimate, Number);
        await Stories.updateAsync(
            { _id: storyId },
            {
                $set: { estimate: estimate },
            }
        );
        const story = await Stories.findOneAsync(storyId);
        await Sessions.updateAsync({ _id: story.sessionId }, { $set: { showStory: null } });
    },
    async setPermission(permission, value, sessionId) {
        check(permission, String);
        check(sessionId, String);
        check(value, Boolean);
        const prop = "perm_" + permission;
        return await Sessions.updateAsync(sessionId, { $set: { [prop]: value } });
    },
    async changeUsername(participant) {
        check(participant, {
            name: String,
            id: String,
        });
        await Stories.updateAsync(
            { "participants.id": participant.id },
            {
                $set: {
                    "participants.$.name": participant.name,
                },
            },
            { multi: true }
        );
    },
    async cancelEstimate(sessionId) {
        check(sessionId, String);
        await Sessions.updateAsync({ _id: sessionId }, { $set: { showStory: null } });
    },
});
