$(document).on('feedPushed', function () {

   showNumberOfFeeds();

});



function showNumberOfFeeds(){
   feedManager.queue.then(function (snapshot) {
      var length;
      if (snapshot.val())
         length = Object.keys(snapshot.val()).length;
      else
          return;

      console.log(length);
      if(length == 0 || length == null || length == undefined){
         $("#divCounter").hide();
      } else{
         feedManager.inbox.then(function (result) {
            $("#divCounter").show().text(result);
         })
      }
   });
}

function showFeed(){


   feedManager.queue.then(function (snapshot) {

      var entitiesArray = snapshot.val();

      // initialize inbox
      feedManager.inbox = 0;
      feedManager.inbox.then(function (result) {
         console.dir(result);
      });


      //show header
      renderTemplate("#feedHeaderTitle-tmpl",{},"#headerTitle");
      $("#headerBreadCrumbs").html("");
      $("#headerMenu").html("");

      //show footer
      renderTemplate("#feedFooter-tmpl",{},"footer");

      //show
      var preContext = new Array();

      for (var key in entitiesArray) {
         preContext.push({type: entitiesArray[key].entityType, uid:entitiesArray[key].entityUid, title: entitiesArray[key].title ,symbol:symbols[entitiesArray[key].entityType]});
      }

      var context = {feeds: preContext};

      renderTemplate("#feedWrapper-tmpl", context, "wrapper");

      
      setActiveEntity("feed", undefined, undefined, undefined, undefined)
   });

}
