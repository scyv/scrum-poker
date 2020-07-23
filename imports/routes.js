import {Meteor} from "meteor/meteor";
import {SessionProps} from "./sessionProperties";
import {COLLECTIONS} from "./collections";
import * as Common from "./common";

Router.configure({
    layoutTemplate: "layout",
});

function isLoggedIn() {
    return Common.getUserName();
}

Router.route(
    "/",
    function () {
        this.render("landing");
    },
    {name: "landing"}
);

Router.route(
    "/datenschutz",
    function () {
        this.render("datenschutz");
    },
    {name: "datenschutz"}
);

Router.route(
    "/login",
    function () {
        this.render("login");
    },
    {name: "login"}
);

Router.route(
    "/session/:sessionId",
    function () {
        if (isLoggedIn()) {
            const sessionId = this.params.sessionId;
            this.wait(
                Meteor.subscribe(COLLECTIONS.SESSIONS, sessionId, () => {
                    Session.set(SessionProps.SELECTED_SESSION, sessionId);
                })
            );
            if (this.ready()) {
                this.render("session");
            } else {
                this.render("loading");
            }
        } else {
            this.render("login");
        }
    },
    {name: "session"}
);

Router.route(
    "/session/:sessionId/story/:storyId",
    function () {
        if (isLoggedIn()) {
            const sessionId = this.params.sessionId;
            const storyId = this.params.storyId;
            this.wait(
                Meteor.subscribe(COLLECTIONS.SESSIONS, sessionId, () => {
                    Session.set(SessionProps.SELECTED_SESSION, sessionId);
                    this.wait(
                        Meteor.subscribe(COLLECTIONS.STORIES, sessionId, () => {
                            Session.set(SessionProps.SELECTED_STORY, storyId);
                        })
                    );
                })
            );
            if (this.ready()) {
                this.render("story");
            } else {
                this.render("loading");
            }
        } else {
            this.render("login");
        }
    },
    {name: "story"}
);
