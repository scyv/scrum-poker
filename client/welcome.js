import { liveStatisticsHandle } from "./main";

import "./welcome.html";

Template.welcome.helpers({
    ready() {
        return liveStatisticsHandle?.ready();
    },
    rounds() {
        return LiveStatistics.findOne()?.sessionCount;
    },
    stories() {
        return LiveStatistics.findOne()?.storyCount;
    },
    storyPoints() {
        return LiveStatistics.findOne()?.storyPoints;
    },
});
