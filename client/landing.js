import { Meteor } from "meteor/meteor";
import { uniqueNamesGenerator, adjectives, colors, animals, countries, names, starWars } from "unique-names-generator";
import * as Common from "../imports/common";
import { SessionProps } from "../imports/sessionProperties";

import "./landing.html";

function startSession() {
    let name = $("#inputSessionName").val() || $("#inputSessionName").attr("placeholder");
    if (!name) {
        const customConfig = {
            dictionaries: [adjectives, colors, animals, countries, names, starWars],
            separator: " ",
            length: 3,
            style: "capital",
        };
        name = uniqueNamesGenerator(customConfig);
    }
    Meteor.call("createSession", name, Common.getUserInfo(), (err, id) => {
        if (err) {
            alert(err);
        } else {
            Session.set(SessionProps.SELECTED_SESSION, undefined);
            Session.set(SessionProps.SELECTED_STORY, undefined);
            Session.set(SessionProps.SELECTED_STORY_OBJ, undefined);
            Router.go("session", { sessionId: id });
        }
    });
}

let sessionNameChangeInterval;
Template.landing.onRendered(() => {
    document.title = "Scrum-Poker";
    const setSessionName = () => {
        const customConfig = {
            dictionaries: [adjectives, colors, animals, countries, names, starWars],
            separator: " ",
            length: 3,
            style: "capital",
        };
        $("#inputSessionName").attr("placeholder", uniqueNamesGenerator(customConfig));
    };
    setSessionName();
    sessionNameChangeInterval = Meteor.setInterval(setSessionName, 3000);
});

Template.landing.onDestroyed(() => {
    Meteor.clearInterval(sessionNameChangeInterval);
});

Template.landing.events({
    "click .btn-create-session"() {
        startSession();
        return false;
    },
    "keydown #inputSessionName"(evt) {
        if (evt.keyCode === 13) {
            evt.preventDefault();
            startSession();
            return false;
        }
    },
});
