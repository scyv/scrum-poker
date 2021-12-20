import { SessionProps } from "./sessionProperties";

export function getUserName() {
    Session.get(SessionProps.USER_NAME); // needed for reactivity
    const userName = localStorage.getItem("userName");

    // we removed ostrio:cstorage which stores strings with " around
    if (userName && userName.startsWith('"') && userName.endsWith('"')) {
        const normalized = userName.substring(1, userName.length - 1);
        setUserName(normalized);
        return normalized;
    }
    return userName;
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
