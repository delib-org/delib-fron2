$(document).on('feedPushed', function () {

   showNumberOfFeeds();
});

//feedManager.promise.then(function(){
//   //new message
//      //indication
//      //feedManager.queue.length
//
//
//
//     // rerender feed if on feed
//      feedManager.queue
//});

function showNumberOfFeeds(){
   if(feedManager.queue.length == 0 || feedManager.queue.length == null || feedManager.queue.length == undefined){
      $("#divCounter").hide();
   } else{
      $("#divCounter").show().text(feedManager.queue.length);
   }
}

function showFeed(){
   feedManager.inbox.set(0);
   feedManager.promise.resolve();
   //show header

   renderTemplate("#feedHeaderTitle-tmpl",{},"#headerTitle");
   $("#headerBreadCrumbs").html("");
   $("#headerMenu").html("");

   //show footer

   renderTemplate("#feedFooter-tmpl",{},"footer");
   //show wrapper

}
