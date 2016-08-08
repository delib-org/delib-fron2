var feedsArray = new Array();

function setFeeds(){

   setGroupsFeed();
}

function setGroupsFeed(){
   DB.child("users/"+userUuid+"/updates/feeds/groups").on("value", function(groupsfeedSettings){
      groupsfeedSettings.forEach(function(groupFeedSettings){
         var isOwnerCall = groupFeedSettings.val().ownerCalls;

//         if (isOwnerCall){
//            console.log(groupFeedSettings.key);
//            var groupsCallDB = DB.("groups/"+groupFeedSettings.key+"/ownerCalls");
//            groupsCallDB.orderByChild("date").limitToLast(1).on("child_added", function(ownerCall){
//               var entityType = "groups";
//               var groupUid = groupFeedSettings.key;
//               var call = ownerCall.val().call;
//               var date = ownerCall.val().date;
//               var callObject = {entityType: entityType, uid: groupUid, call: call, date: date};
//
//               feedsArray.unshift(callObject);
//               console.log("owner call at: "+ callObject.date);
//           })
//         }
      })
   })
}
