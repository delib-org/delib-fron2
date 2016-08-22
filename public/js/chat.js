
function clearChat(){
   $("wrapper").html("");
}

function showChat(){

   clearChat();

   var chatUid = activeEntity.uid;
   var entityType = activeEntity.entity;

   //show Header
   DB.child(entityType+"/"+chatUid).once("value", function(dataSnapshot){
      var entityTypeLocal = entityTypeToHebrew(entityType);
      renderTemplate("#chatsHeader-tmpl",{entityType:entityTypeLocal, title:dataSnapshot.val().title },"#headerTitle");

      DB.child("chats/"+chatUid).update({title: "("+entityTypeLocal+") "+ dataSnapshot.val().title})

   });

   //show footer
   renderTemplate("#chatInput-tmpl",{},"footer");

   //listen to enter from input
   $("#chatInputTxt").keypress(function (e) {
      if (e.keyCode == 13) {
         e.preventDefault();

         addChatMessagePre(chatUid,entityType);
      }
   });

   //get chat messages

   var chatCallback = function(chats){
      if(chats.exists()){
         var text = chats.val().text;
         var time =  parseDate(chats.val().dateAdded);
         var author = chats.val().userName;

         var context = {text:text, time: time, author:author};
         appendTemplate("#chatMessage-tmpl", context, "wrapper");

         $('wrapper').scrollTop($('wrapper')[0].scrollHeight);
      }

//      if (userUpdatesSet) {
//         $("#globalNotificationsSub").css("color", activeColor);
//      } else {
//         $("#globalNotificationsSub").css("color", inactiveColor);
//      }
   };

   DB.child("chats/"+chatUid).orderByChild("dateAdded").limitToLast(20).on("child_added", chatCallback);

   setActiveEntity("chats", chatUid, "child_added", chatCallback);

   //Notifications

   userUpdates = DB.child("users/"+userUuid+"/entityNotifications/"+activeEntity.entity+"/"+activeEntity.uid);

   userUpdates.once('value', function(data) {

      userUpdatesSet = data.child("/globalNotifications").exists();

      if(userUpdatesSet)
         DB.child("users/"+userUuid+"/chatInboxes/"+chatUid).set(0);

   });
}


function addChatMessage(chatUid, userUid, text, entityType){

   if (text != "") {

      //get user name
      DB.child("users/"+userUid).once("value", function(user) {
         var userName = user.val().name;

         DB.child("chats/"+chatUid).push({dateAdded: firebase.database.ServerValue.TIMESTAMP, user: userUid, userName:userName, text: text, chatUid: chatUid,entityType: entityType });

      })
   }
}


function addChatMessagePre(chatUid, entityType){

   if (chatUid == null || chatUid == undefined){
      chatUid = activeEntity.uid;
      entityType = activeEntity.entity;
   }

   var inputValue=$("#chatInputTxt").val();
   addChatMessage(chatUid, userUuid, inputValue, entityType);
   $("#chatInputTxt").val("");
}





