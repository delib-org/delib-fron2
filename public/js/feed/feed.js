$(document).on('feedPushed', function () {

   showNumberOfFeeds();

});

function showNumberOfFeeds(){
   feedManager.queue.then(function (snapshot) {
      if (snapshot.val()) {

         console.log('render snapshot')

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
     //
     console.log("Hai: "+entitiesArray)
      //show
      var preContext = new Array();

      for (var key in entitiesArray) {

         preContext.push({
           type: entitiesArray[key].entityType,
           uid: entitiesArray[key].entityUid,
           title: entitiesArray[key].title,
           description:entitiesArray[key].description,
           symbol: symbols[entitiesArray[key].entityType],
           counter: entitiesArray[key].chatMessagesCounter,
           date: entitiesArray[key].date
         });
      }
      console.dir(preContext)
      var context = {feeds: preContext};

      renderTemplate("#feedWrapper-tmpl", context, "wrapper");

      var turnOff = function () {
            feedManager.queue = "popAll";
            feedManager.inbox = 0;
      };
       
      setActiveEntity("feed", undefined, turnOff);  


   });

}
