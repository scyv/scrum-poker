import { ClientStorage } from "meteor/ostrio:cstorage";
import { SessionProps } from "./sessionProperties";

export function getUserName() {
    Session.get(SessionProps.USER_NAME); // needed for reactivity
    return ClientStorage.get("userName");
}

export function setUserName(userName) {
    Session.set(SessionProps.USER_NAME, userName);
    ClientStorage.set("userName", userName);
}

export function median(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted[middle];
}
