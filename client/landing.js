import { Meteor } from "meteor/meteor"
import * as Common from "../imports/common";
import { SessionProps} from "../imports/sessionProperties"

import './landing.html';

Template.landing.events({
   'click .btn-create-session'(evt) {
       evt.preventDefault();
       const name = $("#inputSessionName").val();
        Meteor.call("createSession", name, Common.getUserName(), (err, id) => {
            if (err) {
                alert(err);
            } else {
                Router.go("session", {sessionId: id});
            }
        });
       return false;
   }
});