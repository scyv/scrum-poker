import { Meteor } from "meteor/meteor";
import { SessionProps } from "../imports/sessionProperties";
import * as Common from "../imports/common";
import { Sessions, Stories, LiveStatistics } from "../imports/collections";
import { confetti } from "./confetti";
import { sessionsHandle, storiesHandle } from "./main";
import { handleData } from "./storyImporter";

import "./session.html";

async function createStory(name = $("#inputStoryName").val().trim()) {
    const sessionId = Session.get(SessionProps.SELECTED_SESSION);
    try {
        await Meteor.callAsync("createStory", name, sessionId);
        $("#inputStoryName").val("");
    } catch (err) {
        alert(err);
    }
}

function typeSelected() {
    const sessionId = Session.get(SessionProps.SELECTED_SESSION);
    return Sessions.findOne({ _id: sessionId }).type;
}

Template.session.onRendered(async () => {
    const sessionId = Session.get(SessionProps.SELECTED_SESSION);
    document.title = (await Sessions.findOneAsync({ _id: sessionId })).name;
    const session = await Sessions.findOneAsync({ _id: sessionId });
    if (session && !session.owner) {
        await Meteor.callAsync("setSessionOwner", sessionId, Common.getUserInfo());
    }

    if (!localStorage.getItem("confetti2000")) {
        const sessionCount = LiveStatistics.findOne()?.sessionCount ?? 0;
        if (sessionCount >= 2000 && sessionCount < 2015) {
            window.setTimeout(() => {
                confetti.stop();
                localStorage.setItem("confetti2000", true);
            }, 10000);
            $("#confetti-modal").modal().show();
            confetti.start();
        }
    }
});

Template.session.helpers({
    isLoading() {
        return !(sessionsHandle.ready() && storiesHandle.ready());
    },
    userName() {
        return Common.getUserName();
    },
    storiesAvailable() {
        return Stories.find().count() > 0;
    },
    sessionName() {
        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        return Sessions.findOne({ _id: sessionId }).name;
    },
    sessionId() {
        return Session.get(SessionProps.SELECTED_SESSION);
    },
    stories() {
        return Stories.find();
    },
    selectedStoryObj() {
        return Session.get(SessionProps.SELECTED_STORY_OBJ);
    },
    spsum() {
        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        if (Sessions.findOne({ _id: sessionId }).type !== "fibonacci") {
            return "---";
        }

        let sum = 0;
        Stories.find().forEach((s) => {
            if (s.estimate) {
                sum += s.estimate;
            }
        });
        return (sum.toFixed(1).includes(".0") ? sum : sum.toFixed(1)) + " SP";
    },
    checkpermission(perm) {
        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        return Sessions.findOne({ _id: sessionId })["perm_" + perm];
    },
    isAllowed(perm) {
        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        const session = Sessions.findOne({ _id: sessionId });
        return session.owner === Common.getUserId() || session["perm_" + perm];
    },
    isOwner() {
        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        const session = Sessions.findOne({ _id: sessionId });

        return session.owner === Common.getUserId();
    },
    isRunning() {
        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        const session = Sessions.findOne({ _id: sessionId });

        if (session.showStory && session.showStory !== Session.get(SessionProps.SELECTED_STORY)) {
            Router.go("story", {
                sessionId: sessionId,
                storyId: session.showStory,
            });
        }
        return this._id === session.showStory;
    },
    typeSelected() {
        return typeSelected();
    },
});

function eventUnderControl(event) {
    event.stopPropagation();
    event.preventDefault();
}

Template.session.events({
    async "click .btn-choose-type"(evt) {
        evt.preventDefault();
        await Meteor.callAsync(
            "chooseSessionType",
            $("input:radio[name=sessionType]:checked").val(),
            Session.get(SessionProps.SELECTED_SESSION)
        );
    },
    "click .btn-create-story"(evt) {
        evt.preventDefault();
        createStory();
    },
    "keydown #inputStoryName"(evt) {
        if (evt.keyCode === 13) {
            evt.preventDefault();
            createStory();
            return false;
        }
    },
    async "click .btn-start-poker"() {
        const storyId = this._id;
        await Meteor.callAsync("setStory", Session.get(SessionProps.SELECTED_SESSION), this._id);
        Router.go("story", {
            sessionId: Session.get(SessionProps.SELECTED_SESSION),
            storyId: storyId,
        });
    },
    "click .btn-edit-story"() {
        Session.set(SessionProps.SELECTED_STORY_OBJ, this);
    },
    async "click .btn-update-story"() {
        const newName = $(".inputStoryName").val();
        await Meteor.callAsync("updateStory", Session.get(SessionProps.SELECTED_STORY_OBJ), newName);
    },
    async "click .btn-delete-story"() {
        await Meteor.callAsync("deleteStory", Session.get(SessionProps.SELECTED_STORY_OBJ));
    },
    async "change #cbPermCreateStory"() {
        await Meteor.callAsync(
            "setPermission",
            "createStory",
            $("#cbPermCreateStory").prop("checked"),
            Session.get(SessionProps.SELECTED_SESSION)
        );
    },
    async "change #cbPermTurnCards"() {
        await Meteor.callAsync(
            "setPermission",
            "turnCards",
            $("#cbPermTurnCards").prop("checked"),
            Session.get(SessionProps.SELECTED_SESSION)
        );
    },
    async "change #cbPermSetEstimate"() {
        await Meteor.callAsync(
            "setPermission",
            "setEstimate",
            $("#cbPermSetEstimate").prop("checked"),
            Session.get(SessionProps.SELECTED_SESSION)
        );
    },

    dragover(evt) {
        const event = evt.originalEvent;
        eventUnderControl(event);
        event.dataTransfer.dropEffect = "copy";
        return false;
    },
    dragenter(evt) {
        const event = evt.originalEvent;
        eventUnderControl(event);
        $(".dropzone").addClass("dragging");
        return false;
    },
    "mouseleave, mouseup, blur"() {
        $(".dropzone").removeClass("dragging");
    },
    drop(evt) {
        if (!typeSelected()) {
            return;
        }
        const event = evt.originalEvent;
        eventUnderControl(event);
        handleData(event.dataTransfer);
        $("#import-modal").modal("show");
        $(".dropzone").removeClass("dragging");
    },
    paste(evt) {
        if (!typeSelected()) {
            return;
        }
        const event = evt.originalEvent;
        eventUnderControl(event);
        handleData(event.clipboardData);
        $("#import-modal").modal("show");
        $(".dropzone").removeClass("dragging");
    },
});
