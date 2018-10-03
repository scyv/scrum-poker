import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { COLLECTIONS } from '../imports/collections';
import { SessionProps} from "../imports/sessionProperties"

import '../imports/routes.js';
import '../imports/methods.js';

import './main.html';
import './session.html';
import './landing.html';


export let sessionsHandle;
export let storiesHandle;
export let estimatesHandle;

Meteor.startup(() => {
    Tracker.autorun(() => {
        const selectedSession = Session.get(SessionProps.SELECTED_SESSION);
        sessionsHandle = Meteor.subscribe(COLLECTIONS.SESSIONS, selectedSession);
        storiesHandle = Meteor.subscribe(COLLECTIONS.STORIES, selectedSession);
        estimatesHandle = Meteor.subscribe(COLLECTIONS.ESTIMATES, selectedSession);
    });
});