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
