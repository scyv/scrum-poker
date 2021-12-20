function currentLink() {
    const url = Router.current().originalUrl;
    return url.startsWith("http") ? url : location.origin + url;
}

Template.shareLink.onRendered(function () {
    $("#qrcode").qrcode({
        size: 300,
        text: currentLink(),
    });
});
Template.shareLink.helpers({
    currentLink() {
        return currentLink();
    },
});
Template.shareLink.events({
    "click .currentLink"() {
        $(".currentLink").select();
    },
});
