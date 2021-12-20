import { SessionProps } from "./sessionProperties";

export function getUserName() {
    Session.get(SessionProps.USER_NAME); // needed for reactivity
    return localStorage.getItem("userName");
}

export function setUserName(userName) {
    Session.set(SessionProps.USER_NAME, userName);
    localStorage.setItem("userName", userName);
}

export function median(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted[middle];
}
