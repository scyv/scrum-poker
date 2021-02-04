import { statisticsHandle } from "./main";

import "./welcome.html";

Template.welcome.helpers({
    ready() {
        return statisticsHandle && statisticsHandle.ready();
    },
    rounds() {
        return Statistics.findOne()?.sessionCount;
    },
    stories() {
        return Statistics.findOne()?.storyCount;
    },
    storyPoints() {
        return Statistics.findOne()?.storyPoints;
    },
});
