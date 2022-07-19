import { Template } from "meteor/templating";
import { COLLECTIONS, Features, Sessions } from "../imports/collections";
import { SessionProps } from "../imports/sessionProperties";
import * as Common from "../imports/common";
import { TSHIRT, VOTE } from "../imports/cards";
import { messages } from "./messages";

import "../imports/routes.js";
import "../imports/methods.js";

import "./main.html";
import "./session.html";
import "./landing.html";
import "./shareLink.html";
import "./datenschutz.html";

import "./features";

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
    isHot() {
        const lastOpen = localStorage.getItem("lastOpen");
        if (!lastOpen) {
            return "🔥";
        }
        if (Features.findOne()?.since > lastOpen) {
            return "🔥";
        }
    },
});

Template.layout.events({
    "click .featmodalopen"() {
        localStorage.setItem("lastOpen", new Date().toISOString());
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

Template.registerHelper("displayValue", (value, withSP) => {
    if (!value) {
        return "";
    }
    const sessionId = Session.get(SessionProps.SELECTED_SESSION);
    const session = Sessions.findOne({ _id: sessionId });
    if (session) {
        if (session.type === "tshirt") {
            return TSHIRT["SP" + value]?.displayValue ?? "";
        }
        if (session.type === "vote") {
            return VOTE["SP" + value]?.displayValue ?? "";
        }
        return value + (withSP === true ? " SP" : "");
    }
    return "";
});
