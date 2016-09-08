   $(document).on('feedPushed', function () {
      console.log('resolved', feedManager.queue.length);

      var feedLength = feedManager.queue.length;
      showNumberOfFeeds(feedLength);
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

function showNumberOfFeeds(x){
   $("#divCounter").text(x);
}

function showFeed(){
   feedManager.promise.resolve();
   //show header

   renderTemplate("#feedHeaderTitle-tmpl",{},"#headerTitle");
   $("#headerBreadCrumbs").html("");
   $("#headerMenu").html("");

   //show footer

   renderTemplate("#feedFooter-tmpl",{},"footer");
   //show wrapper

}
