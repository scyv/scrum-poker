import { Meteor } from "meteor/meteor"
import * as Common from "../imports/common";
import { SessionProps} from "../imports/sessionProperties"

import {statisticsHandle} from "./main";

import './landing.html';

function startSession() {
    const name = $("#inputSessionName").val();
    Meteor.call("createSession", name, Common.getUserName(), (err, id) => {
        if (err) {
            alert(err);
        } else {
            Router.go("session", {sessionId: id});
        }
    });
}

Template.landing.onRendered(()=> {
    document.title = "Scrum-Poker";
});

Template.landing.helpers({
    ready() {
        return statisticsHandle && statisticsHandle.ready();
    },
    rounds() {
        return Statistics.findOne().sessionCount;
    },
    stories() {
        return Statistics.findOne().storyCount;
    },
    storyPoints() {
        return Statistics.findOne().storyPoints;
    }
});

Template.landing.events({
    'click .btn-create-session'() {
        startSession();
        return false;
    },
    'keydown #inputSessionName'(evt) {
        if (evt.keyCode === 13) {
            evt.preventDefault();
            startSession();
            return false;
        }
    },
    'click .btn-open-session'() {
        const id = $("#inputSessionId").val();

        const storyRegex = /\/story\/([a-zA-Z0-9]+)$/;
        const sessionRegex = /\/session\/([a-zA-Z0-9]+)/;

        const storyMatch = id.match(storyRegex);
        const sessionMatch = id.match(sessionRegex);
        if (storyMatch) {
            Router.go("story", {
                sessionId: sessionMatch[1],
                storyId: storyMatch[1]
            });
        } else if (sessionMatch) {
            Router.go("session", {sessionId: sessionMatch[1]});
        } else {
            Router.go("session", {sessionId: id});
        }

    }
});