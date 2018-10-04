import { Meteor } from "meteor/meteor"
import * as Common from "../imports/common";
import { SessionProps} from "../imports/sessionProperties"
import {COLLECTIONS} from "../imports/collections";

import { sessionsHandle, storiesHandle} from "./main";

import './session.html';

Template.session.helpers({
    isLoading() {
        return !(sessionsHandle.ready() && storiesHandle.ready());
    },
    stories() {
        return Stories.find();
    }
});

Template.session.events({
    'click .btn-create-story'(evt) {
        evt.preventDefault();
        const name = $("#inputStoryName").val();
        const sessionId = Session.get(SessionProps.SELECTED_SESSION);
        Meteor.call("createStory", name, sessionId, (err) => {
            if (err) {
                alert(err);
            } else {
                $("#inputStoryName").val("");
                Meteor.subscribe(COLLECTIONS.STORIES, Session.get(SessionProps.SELECTED_SESSION));
            }
        });
    },
    'click .btn-start-poker'() {
        const storyId = this._id;
        Meteor.call("setStory", Session.get(SessionProps.SELECTED_SESSION), this._id, () => {
            Router.go("story", {
                sessionId: Session.get(SessionProps.SELECTED_SESSION),
                storyId: storyId
            });
        })
    }
});