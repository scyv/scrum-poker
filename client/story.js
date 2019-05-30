import {Meteor} from "meteor/meteor"
import {ReactiveVar} from "meteor/reactive-var"

import * as Common from "../imports/common";
import {SessionProps} from "../imports/sessionProperties"
import {CARDS} from "../imports/cards"

import {sessionsHandle, storiesHandle} from "./main";


import './story.html'

let selectedCardIdx = new ReactiveVar(0);

function isParticipant(story) {
    return story.participants && story.participants.some(entry => entry.name === Common.getUserName());
}

function getSelectedCardKey() {
    const keys = Object.keys(CARDS);
    return keys[selectedCardIdx.get() % keys.length];
}

function increaseCardIndex() {
    selectedCardIdx.set(selectedCardIdx.get() + 1);
}

function decreaseCardIndex() {
    const currentIdx = selectedCardIdx.get();
    if (currentIdx === 0) {
        selectedCardIdx.set(Object.keys(CARDS).length - 1);
    } else {
        selectedCardIdx.set(currentIdx - 1);
    }
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

function saveEstimate() {
    if (getSession().owner === Common.getUserName()) {
        Meteor.call("saveEstimate", Session.get(SessionProps.SELECTED_STORY), parseInt($('#inputStoryPoints').val()));
    }
}

function setReady() {
    Meteor.call("estimateReady",
        Common.getUserName(),
        Session.get(SessionProps.SELECTED_STORY),
        getSelectedCardKey()
    );
}

function setNotReady() {
    Meteor.call("estimateNotReady", Common.getUserName(), Session.get(SessionProps.SELECTED_STORY));
}

function handleShortcuts(evt) {
    const isReady = Session.get("ready");
    if (!isReady) {
        if (evt.which === 37) { // left
            decreaseCardIndex();
        }
        if (evt.which === 39) { // right
            increaseCardIndex();
        }
    }

    if (evt.which === 13 || evt.which === 32) { // enter or space
        if (isReady) {
            setNotReady();
        } else {
            setReady();
        }
    }
}

Template.story.onRendered(function () {
    selectedCardIdx.set(1);
    $(document).bind("keydown", handleShortcuts);
});

Template.story.onDestroyed(function () {
    $(document).unbind("keydown", handleShortcuts)
});

Template.story.helpers({
    isLoading() {
        return !(sessionsHandle.ready() && storiesHandle.ready());
    },
    isOwner() {
        return getSession().owner === Common.getUserName();
    },
    isReady() {
        Session.set("ready", this.ready);
        return this.ready;
    },
    isParticipant() {
        return isParticipant(this);
    },
    story() {
        return getStory();
    },
    formattedEstimate() {
        return this.estimate ? (this.estimate + "SP") : "--";
    },
    participants() {
        return [
            ...this.participants.filter((p) => p.name === Common.getUserName()),
            ..._.sortBy(this.participants.filter((p) => p.name !== Common.getUserName()), (p) => {
                return p.name;
            })
        ];
    },
    showOrHide() {
        return this.allVisible ? "verdecken" : "zeigen";
    },
    itsMe() {
        if (this.name === Common.getUserName()) {
            return "its-me";
        }
        return null;
    },
    cardImage() {
        const story = getStory();
        if (this.participant) {
            if (story.allVisible && this.participant.ready) {
                return CARDS[this.participant.estimate];
            } else {

                if (this.participant.name === Common.getUserName()) {
                    return CARDS[getSelectedCardKey()];
                } else {
                    return CARDS.COVER;
                }
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
        if (!this.participant.ready) {
            increaseCardIndex();
        }
    },
    'click .its-me .next-card'() {
        if (!this.ready) {
            increaseCardIndex();
        }
    },
    'click .its-me .prev-card'() {
        if (!this.ready) {
            decreaseCardIndex();
        }
    },
    'click .btn-ready'() {
        setReady();
    },
    'click .btn-not-ready'() {
        setNotReady();
    },
    'click .btn-turn-cards'() {
        Meteor.call("turnCards", Session.get(SessionProps.SELECTED_STORY));
    },
    'click .btn-overview'() {
        Router.go("session", {sessionId: Session.get(SessionProps.SELECTED_SESSION)});
    },
    'click .btn-save-estimate'() {
        saveEstimate();
    },
    'keydown #inputStoryPoints'(evt) {
        if (evt.keyCode === 13) {
            evt.preventDefault();
            saveEstimate();
            return false;
        }
    }
});
