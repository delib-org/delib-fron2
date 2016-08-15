<<<<<<< HEAD
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
//            })
//         }
      })
   })
}
=======
// function listenToNotifications (uuid){
//
//    listenToChats(uuid);
//
// }
//
// function listenToChats(uuid){
//    //listen or unlisten to chats
//
//    chatsDB = DB.child("users/"+uuid+"/updates/chats");
//
//    chatsDB.on("child_added", function(notification){
//
//       DB.child("chats/"+notification.key).limitToLast(2).on("child_added",listenToChats)
//    });
//
//    chatsDB.on("child_removed", function(notification){
//       DB.child("chats/"+notification.key).off("child_added", listenToChats)
//    });
//
//    var listenToChats = function(newMessage){
//       var massegeTime = parseDate(newMessage.val().dateAdded)
//       console.log(newMessage.key, newMessage.val().userName, newMessage.val().text, massegeTime, newMessage.val().chatUid, newMessage.val().entityType);
//    }
// }
>>>>>>> master
