import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";

import * as Common from "../imports/common";
import { SessionProps } from "../imports/sessionProperties";
import { CARDS } from "../imports/cards";

import { sessionsHandle, storiesHandle } from "./main";

import "./story.html";

let selectedCardIdx = new ReactiveVar(0);

function isParticipant(story) {
    return story.participants && story.participants.some((entry) => entry.name === Common.getUserName());
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
            storyId: session.showStory,
        });
    }
    return session;
}

function getStory() {
    return Stories.findOne(Session.get(SessionProps.SELECTED_STORY));
}

function saveEstimate() {
    if (getSession().owner === Common.getUserName()) {
        Meteor.call("saveEstimate", Session.get(SessionProps.SELECTED_STORY), parseInt($("#inputStoryPoints").val()) || 0);
    }
}

function setReady() {
    Meteor.call("estimateReady", Common.getUserName(), Session.get(SessionProps.SELECTED_STORY), getSelectedCardKey());
}

function setNotReady() {
    Meteor.call("estimateNotReady", Common.getUserName(), Session.get(SessionProps.SELECTED_STORY));
}

function handleShortcuts(evt) {
    const isReady = Session.get("ready");
    if (!isReady) {
        if (evt.key === "ArrowLeft") {
            // left
            decreaseCardIndex();
        }
        if (evt.key === "ArrowRight") {
            // right
            increaseCardIndex();
        }
    }

    if (evt.key === "ESC") {
        setNotReady();
    }

    if (evt.key === "Enter" || evt.key === " " || evt.key === "Spacebar") {
        // enter or space
        if (isReady) {
            setNotReady();
        } else {
            setReady();
        }
    }

    if (evt.key === "1") {
        selectedCardIdx.set(3);
    }
    if (evt.key === "2") {
        selectedCardIdx.set(4);
    }
    if (evt.key === "3") {
        selectedCardIdx.set(5);
    }
    if (evt.key === "5") {
        selectedCardIdx.set(6);
    }
    if (evt.key === "8") {
        selectedCardIdx.set(7);
    }
    if (evt.key === "0") {
        selectedCardIdx.set(14);
    }
}

Template.story.onRendered(function () {
    selectedCardIdx.set(1);
    $(document).bind("keydown", handleShortcuts);
    document.title = getStory().name;
});

Template.story.onDestroyed(function () {
    $(document).unbind("keydown", handleShortcuts);
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
        return this.estimate ? this.estimate + "SP" : "--";
    },
    participants() {
        return [
            ...this.participants.filter((p) => p.name === Common.getUserName()),
            ..._.sortBy(
                this.participants.filter((p) => p.name !== Common.getUserName()),
                (p) => {
                    return p.name;
                }
            ),
        ];
    },
    showOrHide() {
        return this.allVisible ? "verdecken" : "zeigen";
    },
    allVisible() {
        return this.allVisible;
    },
    proposal() {
        return Math.floor(_.reduce(this.participants, function(memo, p) {
            if (!p.estimate) {
                return memo;
            }
            return memo + parseInt(p.estimate.substring(2), 10);
        }, 0) / (this.participants.length === 0 ? 1 : this.participants.length));
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
    },
});

Template.story.events({
    "click .btn-participate"() {
        Meteor.call("participate", Common.getUserName(), Session.get(SessionProps.SELECTED_STORY));
    },
    "click .btn-cancel-participation"() {
        Meteor.call("cancelParticipation", Common.getUserName(), Session.get(SessionProps.SELECTED_STORY));
    },
    "click .its-me img"() {
        if (!this.participant.ready) {
            increaseCardIndex();
        }
    },
    "click .its-me .next-card"() {
        if (!this.ready) {
            increaseCardIndex();
        }
    },
    "click .its-me .prev-card"() {
        if (!this.ready) {
            decreaseCardIndex();
        }
    },
    "click .btn-ready"() {
        setReady();
    },
    "click .btn-not-ready"() {
        setNotReady();
    },
    "click .btn-turn-cards"() {
        Meteor.call("turnCards", Session.get(SessionProps.SELECTED_STORY));
    },
    "click .btn-overview"() {
        Router.go("session", { sessionId: Session.get(SessionProps.SELECTED_SESSION) });
    },
    "click .btn-save-estimate"() {
        saveEstimate();
    },
    "keydown #inputStoryPoints"(evt) {
        if (evt.keyCode === 13) {
            evt.preventDefault();
            saveEstimate();
            evt.target.blur();
            return false;
        }
    },
});
