function showGroup(groupUid){

   //show header

   //show footer&header

   DB.child("groups/"+groupUid).once("value", function(dataSnapshot){
      //show header
      var title = dataSnapshot.val().title;
      renderTemplate("#groupHeaderTitle-tmpl", {group: title}, "#headerTitle");
      renderTemplate("#headerMenu-tmpl", {chatUid: groupUid, entityType: "groups"}, "#headerMenu");

      //    getLocalNotifications();
      

      //show footer
      $("footer").html("");

      isMembership();
   });


   var showGroupCallback = function(topics){


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

   //show wrapper
   DB.child("groups/"+groupUid+"/topics").on("value", showGroupCallback);
   setAcitveEntity("groups", groupUid, "value", showGroupCallback);


   if(!back){
      setUrl("group", groupUid);
   }

}


//show group topics
//function showGroupTopics(groupUid){
//   //get group topics
//
//   DB.child("groups/"+ groupUid.toString()+"/topics").on("value",
//}
