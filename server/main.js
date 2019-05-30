import {Meteor} from "meteor/meteor";
import {COLLECTIONS} from "../imports/collections";
import * as Excel from "node-excel-export";
import "../imports/methods";

Meteor.startup(() => {
    Sessions.find().forEach(sess => {
        if (sess.stories) {
            sess.stories.forEach(story => {
                console.log("Migrating story: " + story);
                Stories.update({_id: story}, {$set: {sessionId: sess._id}});
                Sessions.update({_id: sess._id}, {$set: {stories: null}});
            })
        }
    });
});

Meteor.publish(COLLECTIONS.SESSIONS, sessionId => {
    return Sessions.find({_id: sessionId});
});

Meteor.publish(COLLECTIONS.ESTIMATES, storyId => {
    const story = Stories.findOne({_id: storyId});
    if (story) {
        return Estimates.find({_id: {$in: story.estimates}});
    }
    return [];
});

Meteor.publish(COLLECTIONS.STORIES, sessionId => {
    return Stories.find({sessionId: sessionId});
});

Router.route("/session/download/:sessionId", function () {

    const styles = {
        header: {
            fill: {
                fgColor: {
                    rgb: 'FFFFFFFF'
                }
            },
            font: {
                color: {
                    rgb: 'FF000000'
                },
                bold: true,
                underline: false
            }
        }
    };

    const specification = {
        name: {
            displayName: 'Name',
            width: '50',
            headerStyle: styles.header
        },
        estimate: {
            displayName: 'Schätzung',
            width: '10',
            headerStyle: styles.header
        }
    };

    const session = Sessions.findOne(this.params.sessionId);
    const dataset = Stories.find({sessionId: this.params.sessionId}, {
        fields: {
            "name": 1,
            "estimate": 1
        }
    }).fetch();

    const report = Excel.buildExport(
        [
            {
                name: session.name,
                specification: specification,
                data: dataset
            }
        ]
    );

    const headers = {
        "Content-type": "application/vnd.openxmlformats",
        "Content-Disposition": "attachment; filename=Stories.xlsx"
    };
    this.response.writeHead(200, headers);
    this.response.end(report, "binary");

}, {where: "server"});