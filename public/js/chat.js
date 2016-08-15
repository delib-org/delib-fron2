
function clearChat(){
   $("wrapper").html("");
}

function showChat(){

   clearChat();

   setAcitveEntity("chats", chatUid);

   var chatUid = activeEntity.uid;
   var entityType = activeEntity.entity;

   //show Header
   DB.child(entityType+"/"+chatUid).once("value", function(dataSnapshot){
      var entityTypeLocal = entityTypeToHebrew(entityType);
      renderTemplate("#chatsHeader-tmpl",{entityType:entityTypeLocal, title:dataSnapshot.val().title },"#headerTitle");

   });

   //show footer
   renderTemplate("#chatInput-tmpl",{},"footer");

   //listen to enter from input
   $("#chatInputTxt").keypress(function (e) {
      if (e.keyCode == 13) 
         e.preventDefault();

  //get chat messages
  // DB.child("chats/"+chatUid).off();
  DB.child("chats/"+chatUid).orderByChild("dateAdded").limitToLast(20).on("child_added", function(chats){
    if(chats.exists()) {
       var text = chats.val().text;
       var time = parseDate(chats.val().dateAdded);
       var author = chats.val().userName;


       //get chat messages
       DB.child("chats/" + chatUid).orderByChild("dateAdded").limitToLast(20).on("child_added", chatsCallback);

       var chatsCallback = function (chats) {

          if (chats.exists()) {
             var text = chats.val().text;
             var time = parseDate(chats.val().dateAdded);
             var author = chats.val().userName;

             var context = {text: text, time: time, author: author};
             appendTemplate("#chatMessage-tmpl", context, "wrapper");

             $('wrapper').scrollTop($('wrapper')[0].scrollHeight);
          }

       }
    }
  });

   entitiesCallbacks.chats.callback = chatsCallback;
   entitiesCallbacks.chats.eventType = "child_added";

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





