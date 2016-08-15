function showGroup(groupUid){

   //show header

   DB.child("groups/"+groupUid).once("value",function(dataSnapshot){
      var title = dataSnapshot.val().title;
      renderTemplate("#groupHeaderTitle-tmpl", {group: title}, "#headerTitle");
      renderTemplate("#headerMenu-tmpl", {chatUid: groupUid, entityType: "groups"}, "#headerMenu");
      //    getLocalNotifications();
      //      if (userUpdatesSet) {
      //         $("#globalNotificationsSub").css("color", activeColor);
      //      } else {
      //         $("#globalNotificationsSub").css("color", inactiveColor);
      //      }

      isMembership();
   });

   //show footer
   $("footer").html("");

   //show wrapper
   var groupCallback = function(topics){

      if(topics.exists()){

         var topicsUnderGroup = topics.val();
         var numberOfTopics = Object.keys(topicsUnderGroup).length;
         var topicsArray = new Array();

         var i = 1;

         topics.forEach(function(topic){

            DB.child("topics/"+topic.key).once("value", function(data){

               var preContext = new Object();

               if (data.exists()){

                  var title = data.val().title;
                  var description = data.val().description;
                  //          console.log("t: "+ title + ", d: "+ description);

                  preContext = {
                     uuid: topic.key,
                     title: title,
                     description: description
                  }

                  topicsArray.push(preContext);
               }

               if (i === numberOfTopics){
                  var context = {groups: topicsArray};
                  renderTemplate("#groupPage-tmpl", context, "wrapper");
                  $("wrapper").hide();
                  $("wrapper").fadeIn();
               }

               i++;
            })
         })
      } else {
         renderTemplate("#groupPage-tmpl",{}, "wrapper");
      }
   };

   DB.child("groups/"+groupUid+"/topics").on("value",groupCallback);

   setActiveEntity("groups", groupUid, "value", groupCallback);
}


//show group topics

