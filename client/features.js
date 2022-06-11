import { Meteor } from "meteor/meteor";
import { COLLECTIONS, Features } from "../imports/collections";

import "./features.html";

let featuresLoading = new ReactiveVar(true);

Template.features.onRendered(() => {
    Meteor.subscribe(
        COLLECTIONS.FEATURES,
        () => {
            // onstop
            featuresLoading.set(true);
        },
        () => {
            // onready
            featuresLoading.set(false);
        }
    );
});

Template.features.helpers({
    isLoading() {
        return featuresLoading.get();
    },
    features() {
        return Features.find();
    },
    since() {
        return new Date(this.since).toLocaleDateString();
    },
});
