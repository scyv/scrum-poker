import { Meteor } from "meteor/meteor"
import { ReactiveVar } from "meteor/reactive-var"

import * as Common from "../imports/common";
import { SessionProps} from "../imports/sessionProperties"
import { CARDS } from "../imports/cards"
import { sessionsHandle, storiesHandle} from "./main"


import './story.html'

let selectedCardIdx = new ReactiveVar(0);

function isParticipant(story) {
    return story.participants && story.participants.some(entry => entry.name === Common.getUserName());
}

function getSelectedCardKey() {
    const keys = Object.keys(CARDS);
    return keys[selectedCardIdx.get() % keys.length];
}

function getSession() {
    const selectedSession = Session.get(SessionProps.SELECTED_SESSION);
    const session = Sessions.findOne(selectedSession);
    if (session.showStory !== Session.get(SessionProps.SELECTED_STORY)) {
        Router.go("story", {
            sessionId: selectedSession,
            storyId: session.showStory
        });
    }
    return session;
}

function getStory() {
    return Stories.findOne(Session.get(SessionProps.SELECTED_STORY));
}

Template.story.onRendered(function () {
    selectedCardIdx.set(1);
});

Template.story.helpers({
    session() {
        const session = getSession();
        if (!session || session.owner !== Common.getUserName()) {
            return null;
        }
        return session;
    },
    isOwner() {
        return getSession().owner === Common.getUserName();
    },
    isReady() {
        return this.ready;
    },
    isParticipant() {
        return isParticipant(this);
    },
    story() {
        return getStory();
    },
    participants() {
        return _.sortBy(this.participants, (p) => {
            return p.name;
        })
    },
    itsMe() {
        if (this.name === Common.getUserName()) {
            return "its-me";
        }
        return null;
    },
    cardImage() {
        const story = getStory();
        if (story.allVisible && this.ready) {
            return CARDS[this.estimate];
        } else {
            if (this.name === Common.getUserName()) {
                return CARDS[getSelectedCardKey()];
            } else {
                return CARDS.COVER;
            }
        }
    }
});

Template.story.events({
    'click .btn-participate'() {
        Meteor.call("participate", Common.getUserName(), Session.get(SessionProps.SELECTED_STORY));
    },
    'click .btn-cancel-participation'() {
        Meteor.call("cancelParticipation", Common.getUserName(), Session.get(SessionProps.SELECTED_STORY));
    },
    'click .its-me img'() {
        if (!this.ready) {
            selectedCardIdx.set(selectedCardIdx.get() + 1);
        }
    },
    'click .btn-ready'() {
        Meteor.call("estimateReady",
            Common.getUserName(),
            Session.get(SessionProps.SELECTED_STORY),
            getSelectedCardKey()
        );
    },
    'click .btn-not-ready'() {
        Meteor.call("estimateNotReady", Common.getUserName(), Session.get(SessionProps.SELECTED_STORY));
    },
    'click .btn-turn-cards'() {
        Meteor.call("turnCards", Session.get(SessionProps.SELECTED_STORY));
    },
    'click .btn-overview'() {
        Router.go("session", {sessionId: Session.get(SessionProps.SELECTED_SESSION)});
    },
    'click .btn-save-estimate'() {
        if (getSession().owner === Common.getUserName()) {
            Meteor.call("saveEstimate", Session.get(SessionProps.SELECTED_STORY), parseInt($('#inputStoryPoints').val()));
        }
    }
});
