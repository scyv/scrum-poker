Template.shareLink.helpers({
    currentLink() {
        const url = Router.current().originalUrl;
        return url.startsWith('http') ? url : (location.origin + url);
    }
});
Template.shareLink.events({
   'click .currentLink'() {
       $(".currentLink").select();
   }
});
