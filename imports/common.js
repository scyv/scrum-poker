import { Random } from "meteor/random";

import { SessionProps } from "./sessionProperties";

// deprecated
export function getUserNameDeprecated() {
    Session.get(SessionProps.USER_NAME); // needed for reactivity
    const userName = localStorage.getItem("userName");

    // we removed ostrio:cstorage which stores strings with " around
    if (userName && userName.startsWith('"') && userName.endsWith('"')) {
        const normalized = userName.substring(1, userName.length - 1);
        localStorage.setItem("userName", normalized);
        return normalized;
    }
    return userName;
}

export function setUserInfo(userInfo) {
    return new Promise((resolve) => {
        Session.set(SessionProps.USER_INFO, userInfo);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        Meteor.call("changeUsername", userInfo, () => {
            console.log("reoslvoo");
            resolve();
        });
    });
}

export function getUserId() {
    return getUserInfo().id;
}

export function getUserName() {
    return getUserInfo().name;
}

export function getUserInfo() {
    Session.get(SessionProps.USER_INFO);
    const userInfoItem = localStorage.getItem("userInfo");

    if (userInfoItem) {
        const userInfo = JSON.parse(userInfoItem);
        if (userInfo) {
            return userInfo;
        }
    }

    const userName = getUserNameDeprecated();
    if (userName) {
        localStorage.removeItem("userName");
        setUserInfo({
            name: userName,
            id: Random.id(32),
        });
        return getUserInfo();
    }
    return undefined;
}

export function median(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted[middle];
}
