
function clearChat(){
   $("wrapper").html("");
}

function showChat() {

   // debugger;
   clearChat();

   var headerContent ={};
   var chatUid = activeEntity.uid;
   var chatsCallback = function (chats) {
      // debugger;
      if (chats.exists()) {
         var text = chats.val().text;
         var time = parseDate(chats.val().dateAdded);
         var author = chats.val().userName;

         var context = {text: text, time: time, author: author};
         appendTemplate("#chatMessage-tmpl", context, "wrapper");

         $('wrapper').scrollTop($('wrapper')[0].scrollHeight);
      }
   };

      DB.child("chats/" + chatUid).once('value',function(snapshot) {
         // console.log('chat entity content',activeEntity.entity ,activeEntity.previuosEntity, chatUid, actualContent);
         if (snapshot.exists()){
            headerContent = snapshot.val().entity;
            setActiveEntity("chats", chatUid, "child_added", chatsCallback);
         }
         else {
            setActiveEntity("chats", chatUid, "child_added", chatsCallback);
            DB.child(activeEntity.previuosEntity + "/" + chatUid).once('value', function(actualContent) {
               headerContent = {
                  entityType: entityTypeToHebrew(activeEntity.previuosEntity),
                  title: actualContent.val().title
               };
               console.log(headerContent);
               DB.child("chats/" + chatUid + "/entity").set(headerContent);
            })
         }

         // header rendering
         renderTemplate("#chatsHeader-tmpl",headerContent,"#headerTitle");
         //show footer
         renderTemplate("#chatInput-tmpl",{},"footer");
   }).then(function() {

      //show Header and build chat for the first time
      DB.child("chats/"+chatUid+"/massages").orderByChild("dateAdded").limitToLast(20).once("value", function(dataSnapshot) {
         // actual chat builder
         chatsCallback(dataSnapshot);
      }).then(function(rendered) {
         subsManager.isUpdatesSet();
      });

      DB.child("chats/"+chatUid+"/massages").orderByChild("dateAdded").limitToLast(20).on("child_added", chatsCallback);

      //listen to enter from input
      $("#chatInputTxt").keypress(function (e) {
         if (e.keyCode == 13) {
            e.preventDefault();
            addChatMessagePre(chatUid);
         }
      });
   });
}


function addChatMessage(chatUid,userUid, text) {

   if (text != "") {

      //get user name
      DB.child("users/"+userUid).once("value", function(user) {
         var userName = user.val().name;

         DB.child("chats/"+chatUid+"/massages").push({dateAdded: firebase.database.ServerValue.TIMESTAMP, user: userUid, userName:userName, text: text, chatUid: chatUid});
      })
   }
}


function addChatMessagePre(chatUid) {

   var inputValue = $("#chatInputTxt").val();
   addChatMessage(chatUid, userUuid, inputValue);
   $("#chatInputTxt").val("");
}





