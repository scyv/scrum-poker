import {Meteor} from "meteor/meteor"
import {SessionProps} from "../imports/sessionProperties"

import {sessionsHandle, storiesHandle} from "./main";

import './session.html';

function createStory() {
    const name = $("#inputStoryName").val();
    const sessionId = Session.get(SessionProps.SELECTED_SESSION);
    Meteor.call("createStory", name, sessionId, (err) => {
        if (err) {
            alert(err);
        } else {
            $("#inputStoryName").val("");
        }
    });
}

Template.session.onRendered(() => {
    const sessionId = Session.get(SessionProps.SELECTED_SESSION);
    document.title = Sessions.findOne({_id: sessionId}).name;
});

Template.session.helpers({
    isLoading() {
        return !(sessionsHandle.ready() && storiesHandle.ready());
    },
    storiesAvailable() {
        return Stories.find().count() > 0;
    },
    sessionName() {
        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        return Sessions.findOne({_id: sessionId}).name;
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
    estimate() {
        return this.estimate ? (this.estimate + "SP") : "--";
    },
    spsum() {
        let sum = 0;
        Stories.find().forEach(s => {
            if (s.estimate) {
                sum += s.estimate;
            }
        });
        return sum + "SP";
    }
});

Template.session.events({
    'click .btn-create-story'(evt) {
        evt.preventDefault();
        createStory();
    },
    'keydown #inputStoryName'(evt) {
        if (evt.keyCode === 13) {
            evt.preventDefault();
            createStory();
            return false;
        }
    },
    'click .btn-start-poker'() {
        const storyId = this._id;
        Meteor.call("setStory", Session.get(SessionProps.SELECTED_SESSION), this._id, () => {
            Router.go("story", {
                sessionId: Session.get(SessionProps.SELECTED_SESSION),
                storyId: storyId
            });
        })
    },
    'click .btn-edit-story'() {
        Session.set(SessionProps.SELECTED_STORY_OBJ, this);
    },
    'click .btn-update-story'() {
        const newName = $(".inputStoryName").val();
        Meteor.call("updateStory", Session.get(SessionProps.SELECTED_STORY_OBJ), newName);
    },
    'click .btn-delete-story'() {
        Meteor.call("deleteStory", Session.get(SessionProps.SELECTED_STORY_OBJ));
    }
});