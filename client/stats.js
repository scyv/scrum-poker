import Chart from "chart.js/auto";
import { COLLECTIONS, Statistics } from "../imports/collections";

import "./stats.html";
const dateformat = new Intl.DateTimeFormat("de-de", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
});

const updateChart = () => {
    const statData = Statistics.find({}, { sort: { timestamp: 1 } }).fetch();
    const labels = statData.map((d) => dateformat.format(d.timestamp));
    const data = {
        labels: labels,
        datasets: [
            {
                label: "Storypoints",
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                data: statData.map((d) => d.storyPoints),
                yAxisID: "y",
            },
            {
                label: "Stories",
                backgroundColor: "rgb(99,255, 132)",
                borderColor: "rgb(99,255, 132)",
                data: statData.map((d) => d.storyCount),
                yAxisID: "y",
            },
            {
                label: "Sessions",
                backgroundColor: "rgb(123,99,255)",
                borderColor: "rgb(123,99,255)",
                data: statData.map((d) => d.sessionCount),
                yAxisID: "y1",
            },
        ],
    };
    const config = {
        type: "line",
        data,
        options: {
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                },
                y1: {
                    type: "linear",
                    display: true,
                    position: "right",

                    // grid line settings
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            },
        },
    };
    new Chart(document.getElementById("myChart"), config);
};
let statHandle;
Template.stats.onCreated(() => {
    statHandle = Meteor.subscribe(COLLECTIONS.STATISTICS);
});
Template.stats.onDestroyed(() => {
    statHandle.stop();
});
Template.stats.helpers({
    ready() {
        const isReady = statHandle?.ready();
        if (isReady) {
            window.requestAnimationFrame(() => {
                updateChart();
            });
        }
        return isReady;
    },
});
