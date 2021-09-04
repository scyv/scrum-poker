import { Template } from "meteor/templating";
import { COLLECTIONS } from "../imports/collections";
import { SessionProps } from "../imports/sessionProperties";
import * as Common from "../imports/common";

import "../imports/routes.js";
import "../imports/methods.js";

import "./main.html";
import "./session.html";
import "./landing.html";
import "./shareLink.html";
import "./datenschutz.html";
import { messages } from "./messages";

export let sessionsHandle;
export let storiesHandle;
export let liveStatisticsHandle;

let language = "en";

Meteor.startup(() => {
    Tracker.autorun(() => {
        const selectedSession = Session.get(SessionProps.SELECTED_SESSION);
        sessionsHandle = Meteor.subscribe(COLLECTIONS.SESSIONS, selectedSession);
        storiesHandle = Meteor.subscribe(COLLECTIONS.STORIES, selectedSession);
        liveStatisticsHandle = Meteor.subscribe(COLLECTIONS.LIVE_STATISTICS);
    });

    if (/^de\b/.test(navigator.language)) {
        language = "de";
    }
});

Template.layout.events({
    "click .title"() {
        Router.go("landing");
    },
});

const version = new ReactiveVar("");
Template.layout.onRendered(() => {
    fetch("/revision")
        .then((resp) => resp.text())
        .then((vers) => version.set(vers));
});

Template.layout.helpers({
    userName() {
        return Common.getUserName();
    },
    version() {
        return version.get();
    },
});

const deepJsonSelect = (selector, obj) => {
    const path = selector.split(".");
    let selection = obj;
    const success = path.every((s) => {
        selection = selection[s];
        return selection;
    });
    if (!success) {
        return selector;
    }
    return selection;
};

Template.registerHelper("MSG", (textId) => {
    return deepJsonSelect(textId + "." + language, messages);
});
