import { Meteor } from "meteor/meteor";

import * as Common from "../imports/common";
import { SessionProps } from "../imports/sessionProperties";
import { CARDS, TSHIRT } from "../imports/cards";
import { Stories, Sessions } from "../imports/collections";

import { sessionsHandle, storiesHandle } from "./main";

import "./story.html";

let selectedCardIdx = {
    set(newIdx) {
        Session.set("SELECTED_CARD_IDX", newIdx);
        sessionStorage.setItem("SELECTED_CARD_IDX_" + Session.get(SessionProps.SELECTED_STORY), newIdx);
    },
    get() {
        Session.get("SELECTED_CARD_IDX");
        return parseInt(
            sessionStorage.getItem("SELECTED_CARD_IDX_" + Session.get(SessionProps.SELECTED_STORY)) ?? 1,
            10
        );
    },
};

function isParticipant(story) {
    return story.participants && story.participants.some((entry) => entry.id === Common.getUserId());
}

function cardDeck() {
    const selectedSession = Session.get(SessionProps.SELECTED_SESSION);
    const session = Sessions.findOne(selectedSession);
    if (session.type === "tshirt") {
        return TSHIRT;
    }
    return CARDS;
}

function getSelectedCardKey() {
    const keys = Object.keys(cardDeck());
    return keys[selectedCardIdx.get() % keys.length];
}

function increaseCardIndex() {
    selectedCardIdx.set(selectedCardIdx.get() + 1);
}

function decreaseCardIndex() {
    const currentIdx = selectedCardIdx.get();
    if (currentIdx === 0) {
        selectedCardIdx.set(Object.keys(cardDeck()).length - 1);
    } else {
        selectedCardIdx.set(currentIdx - 1);
    }
}

function getSession() {
    const selectedSession = Session.get(SessionProps.SELECTED_SESSION);
    const session = Sessions.findOne(selectedSession);
    if (!session.showStory) {
        Router.go("session", { sessionId: Session.get(SessionProps.SELECTED_SESSION) });
        return session;
    }

    if (session.showStory !== Session.get(SessionProps.SELECTED_STORY)) {
        Router.go("story", {
            sessionId: selectedSession,
            storyId: session.showStory,
        });
    }
    return session;
}

function getStory() {
    const story = Stories.findOne(Session.get(SessionProps.SELECTED_STORY));
    document.title = story.name;
    return story;
}

function saveEstimate() {
    const session = getSession();
    if (session.owner === Common.getUserId() || session.perm_setEstimate) {
        Meteor.call(
            "saveEstimate",
            Session.get(SessionProps.SELECTED_STORY),
            getEstimate($("#inputStoryPoints").val())
        );
    }
}

function getEstimate(input) {
    let estimate = 0;
    const trimmedInput = input.trim().toLowerCase().replace(",", ".");
    const cards = cardDeck();
    Object.keys(cards).forEach((key) => {
        const card = cards[key];
        if (card.displayValue?.toLowerCase() === trimmedInput || key.substring(2) === trimmedInput) {
            estimate = parseFloat(key.substring(2), 10);
        }
    });
    return estimate;
}

function setReady() {
    const cardKey = getSelectedCardKey();
    if (cardKey === "COVER") {
        return;
    }
    Meteor.call("estimateReady", Common.getUserInfo(), Session.get(SessionProps.SELECTED_STORY), cardKey);
}

function setNotReady() {
    Meteor.call("estimateNotReady", Common.getUserId(), Session.get(SessionProps.SELECTED_STORY));
}

function handleShortcuts(evt) {
    const isReady = Session.get("ready");
    if (!isReady) {
        const cards = cardDeck();
        if (evt.key === "ArrowLeft") {
            // left
            decreaseCardIndex();
            return;
        }
        if (evt.key === "ArrowRight") {
            // right
            increaseCardIndex();
            return;
        }

        let idx = Object.keys(cards).indexOf("SP" + evt.key);
        if (idx >= 0) {
            selectedCardIdx.set(idx);
            return;
        }

        idx = Object.keys(cards).findIndex(
            (card) => cards[card].displayValue?.toLowerCase().indexOf(evt.key.toLowerCase()) === 0
        );
        if (idx >= 0) {
            selectedCardIdx.set(idx);
            return;
        }
    }

    if (evt.key === "Escape") {
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
}

Template.story.onRendered(function () {
    $(document).on("keydown", handleShortcuts);

    const preloadImage = (url) => {
        var img = new Image();
        img.src = url;
    };
    Object.values(CARDS).forEach((card) => {
        preloadImage(card.img);
    });
});

Template.story.onDestroyed(function () {
    $(document).off("keydown", handleShortcuts);
});

Template.story.helpers({
    isLoading() {
        return !(sessionsHandle.ready() && storiesHandle.ready());
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
        return this.estimate >= 0 ? this.estimate + "SP" : "--";
    },
    participants() {
        return [
            ...this.participants.filter((p) => p.id === Common.getUserId()),
            ..._.sortBy(
                this.participants.filter((p) => p.id !== Common.getUserId()),
                (p) => {
                    return p.name;
                }
            ),
        ];
    },
    allVisible() {
        return this.allVisible;
    },
    btnReadyClass() {
        if (this.participants.every((p) => p.ready)) {
            return "success";
        }
        return "primary";
    },
    itsMe() {
        if (this.id === Common.getUserId()) {
            return "its-me";
        }
        return null;
    },
    cardImage(type) {
        const cards = cardDeck();
        if (this.participant) {
            if (this.participant.id === Common.getUserId()) {
                return cards[getSelectedCardKey()];
            } else {
                if (this.participant.ready) {
                    return type === "front" ? cards.COVER : cards[this.participant.estimate];
                } else {
                    return cards.COVER;
                }
            }
        }
    },
    cardTitle() {
        if (this.participant.id === Common.getUserId()) {
            return cardDeck()[getSelectedCardKey()].title;
        } else {
            const story = getStory();
            return story.allVisible && this.participant.ready ? cardDeck()[this.participant.estimate].title : "";
        }
    },
    turnCardos() {
        if (this.participant.id !== Common.getUserId()) {
            const story = getStory();
            return story.allVisible && this.participant.ready ? "turn" : "";
        }
    },
    isAllowed(perm) {
        const session = getSession();
        return session.owner === Common.getUserId() || session["perm_" + perm];
    },
    suggestedEstimate() {
        if (!this.allVisible) {
            return null;
        }
        const estimates = _.compact(
            this.participants.filter((p) => p.estimate).map((p) => parseFloat(p.estimate.substring(2), 10))
        );
        if (estimates.length === 0) {
            return null;
        }
        return _.uniq([Common.median(estimates), _.max(estimates)]);
    },
    isCover() {
        return getSelectedCardKey() === "COVER";
    },
});

Template.story.events({
    "click .btn-participate"() {
        Meteor.call("participate", Common.getUserInfo(), Session.get(SessionProps.SELECTED_STORY));
    },
    "click .btn-cancel-participation"() {
        Meteor.call("cancelParticipation", Common.getUserId(), Session.get(SessionProps.SELECTED_STORY));
    },
    "click .its-me .flip-card"() {
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
            Router.go("session", { sessionId: Session.get(SessionProps.SELECTED_SESSION) });

            return false;
        }
    },
    "click .btn-preset-estimate"(evt) {
        $("#inputStoryPoints").val($(evt.target).data("preset"));
        saveEstimate();
    },
});
