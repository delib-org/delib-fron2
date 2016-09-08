$(document).on('feedPushed', function () {

   showNumberOfFeeds();

});



function showNumberOfFeeds(){
   if(feedManager.queue.length == 0 || feedManager.queue.length == null || feedManager.queue.length == undefined){
      $("#divCounter").hide();
   } else{
      $("#divCounter").show().text(feedManager.inbox.get());
   }
}

function showFeed(){
   feedManager.inbox.set(0);
   //feedManager.promise.resolve();
   //show header

   renderTemplate("#feedHeaderTitle-tmpl",{},"#headerTitle");
   $("#headerBreadCrumbs").html("");
   $("#headerMenu").html("");

   //show footer
   renderTemplate("#feedFooter-tmpl",{},"footer");

   //show
   var entitiesArray = feedManager.queue;
   var preContext = new Array();


   for (i in entitiesArray){
      preContext.push({type: entitiesArray[i].entityType, uid:entitiesArray[i].entityUid, title: entitiesArray[i].title ,symbol:symbols[entitiesArray[i].entityType]});
   }

   var context = {feeds: preContext};

   renderTemplate("#feedWrapper-tmpl", context, "wrapper");
}
