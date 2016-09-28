$(document).on('feedRender', function () {

   showNumberOfFeeds();

});

function showNumberOfFeeds(){
   feedManager.queue.then(function (snapshot) {
      if (snapshot.val()) {

         feedManager.inbox.then(function (result) {
            $("#divCounter").show().text(result);
         })
         
      } else {
         $("#divCounter").hide();
      }
   })
}

function showFeed(){


   feedManager.queue.then(function (snapshot) {

      var entitiesArray = snapshot.val();


      //show header
      renderTemplate("#feedHeaderTitle-tmpl",{},"#headerTitle");
      $("#headerBreadCrumbs").html("");
      $("#headerMenu").html("");

      //show footer
      renderTemplate("#feedFooter-tmpl",{},"footer");

      //show
      var preContext = new Array();

      for (var key in entitiesArray) {

         console.log('')
         preContext.push({type: entitiesArray[key].entityType, uid: entitiesArray[key].entityUid, title: entitiesArray[key].title ,symbol: symbols[entitiesArray[key].entityType]});
      }

      var context = {feeds: preContext};

      renderTemplate("#feedWrapper-tmpl", context, "wrapper");

      var turnOff = function () {
         feedManager.queue = "popAll";
         feedManager.inbox = 0;
      };
      setActiveEntity("feed", undefined, undefined, undefined, turnOff)
   });

}
