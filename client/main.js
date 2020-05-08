import { Template } from "meteor/templating";
import { COLLECTIONS } from "../imports/collections";
import { SessionProps } from "../imports/sessionProperties";

import "../imports/routes.js";
import "../imports/methods.js";

import "./main.html";
import "./session.html";
import "./landing.html";
import "./shareLink.html";
import "./datenschutz.html";

export let sessionsHandle;
export let storiesHandle;
export let statisticsHandle;

Meteor.startup(() => {
    Tracker.autorun(() => {
        const selectedSession = Session.get(SessionProps.SELECTED_SESSION);
        sessionsHandle = Meteor.subscribe(COLLECTIONS.SESSIONS, selectedSession);
        storiesHandle = Meteor.subscribe(COLLECTIONS.STORIES, selectedSession);
        statisticsHandle = Meteor.subscribe("statistics");
    });
});

Template.layout.events({
    "click .title"() {
        Router.go("landing");
    },
});
