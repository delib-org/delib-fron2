//create new topic
function showTopic(topicUid){

   //show header
   DB.child("topics/"+topicUid).once("value", function(dataSnapshot){
      var title = dataSnapshot.val().title;
      renderTemplate("#topicHeaderTitle-tmpl", {topic: title}, "#headerTitle");
      renderTemplate("#headerMenu-tmpl",{type:"topics", uid:topicUid},"#headerMenu");
      showBreadCrumb("topics", topicUid, title);

      $("wrapper").css("overflow","auto");
   }).then(function(rendered) {
      subsManager.isUpdatesSet();
   });

   //show footer
   renderTemplate("#showEntityPanel-tmpl", {}, "footer");

   //show wrapper

   var topicCallback = function(subEntities){

      if(subEntities.exists()){

         var subEntitiesUnderTopic = subEntities.val();
         var numberOfSubEntities = Object.keys(subEntitiesUnderTopic).length;

         var subEntitiesArray = new Array();

         var i = 1;

         subEntities.forEach(function(subEntity){

            var subEntityType = subEntity.val().entityType;

            DB.child(subEntityType+"/"+subEntity.key).once("value", function(data){

               var preContext = new Object();

               if (data.exists()){

                  var title = data.val().title;
                  var description = data.val().description;

                  preContext = {
                     entityType: subEntityType,
                     uuid: subEntity.key,
                     title: title,
                     description: description,
                     symbol: symbols[subEntityType]
                  }

                  subEntitiesArray.push(preContext);
               }

               if (i === numberOfSubEntities){
                  var context = {questions: subEntitiesArray};
                  renderTemplate("#topicPage-tmpl", context, "wrapper");
                  $("wrapper").hide();
                  $("wrapper").fadeIn();

               }

               i++;
            })

         })
      } else {renderTemplate("#topicPage-tmpl",{}, "wrapper");}
   };

   DB.child("topics/"+ topicUid.toString()+"/subEntities").on("value",topicCallback);
   
   var turnOff = function () {
      DB.child("topics/"+ topicUid.toString()+"/subEntities").off("value", topicCallback);
   };
   
   setActiveEntity("topics", topicUid, "value", topicCallback, turnOff);

}



