import { Meteor } from "meteor/meteor"
import * as Common from "../imports/common";
import { SessionProps} from "../imports/sessionProperties"

import './login.html';

Template.login.events({
    'click .btn-save-username'(evt) {
        evt.preventDefault();
        const name = $("#inputUserName").val();
        Common.setUserName(name);
    }
});

Template.login.helpers({
   userName() {
       return Common.getUserName();
   }
});