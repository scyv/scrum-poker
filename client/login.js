import * as Common from "../imports/common";

import "./login.html";

Template.login.events({
    "click .btn-save-username"(evt) {
        evt.preventDefault();
        const name = $("#inputUserName").val();
        Common.setUserName(name);
    },
});

Template.login.helpers({
    userName() {
        return Common.getUserName();
    },
});
