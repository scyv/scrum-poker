import { Random } from "meteor/random";

import * as Common from "../imports/common";

import "./login.html";

Template.login.events({
    async "click .btn-save-username"(evt) {
        evt.preventDefault();
        const name = $("#inputUserName").val();
        const oldUserInfo = Common.getUserInfo();
        await Common.setUserInfo({
            name: name,
            id: oldUserInfo?.id ?? Random.id(64),
        });
        if (oldUserInfo) {
            history.go(-1);
        }
    },
});

Template.login.helpers({
    userName() {
        return Common.getUserName();
    },
});
