
function clearChat(){
   $("wrapper").html("");
}

var chatsCallback = function (chats) {
   console.log('chatsCallback called');
   // debugger;
   if (chats.val().text != undefined) {
      var text = chats.val().text;
      var time = parseDate(chats.val().dateAdded);
      var author = chats.val().userName;

      var context = {text: text, time: time, author: author};
      appendTemplate("#chatMessage-tmpl", context, "wrapper");

      $('wrapper').scrollTop($('wrapper')[0].scrollHeight);
   }
};

function showChat(entityType, uid) {
   console.log("entityType:", entityType)

   clearChat();

   renderTemplate("#chatMenu-tmpl", {type: entityType, uid:uid}, "#headerMenu")

   var headerContent ={};

   // encapsulated .off() firebase call
   var turnOff = function () {
      DB.child("chats/"+uid+"/messages").orderByChild("dateAdded").limitToLast(20).off("child_added", chatsCallback);
   };

   // get specific chat room stuff (== messages and entity content)
   DB.child("chats/" + uid).once('value',function(snapshot) {

      // setActiveEntity should always be called first
      setActiveEntity("chats", uid, "child_added", chatsCallback, turnOff);

      // get actual content, create chat header if needed, implement existing header otherwise
      DB.child(entityType + "/" + uid).once('value', function(actualContent) {
      if (snapshot.exists()) {

            // get existing header
            headerContent = {
               entityType: snapshot.val().entity.entityType,
               title: snapshot.val().entity.title
            };
         } else {

            // create header for chat room
            headerContent = {
               entityType: entityTypeToHebrew(entityType),
               title: actualContent.val().title
            };

            // set new header for latter use
            DB.child("chats/" + uid + "/entity").set({
               entityType: entityTypeToHebrew(entityType),
               title: actualContent.val().title,
               typeInDB: entityType
            });
         }

         // go on rendering and when finished with header setting and active setActiveEntity
      }).then(function(){

         // header rendering
         renderTemplate("#chatsHeader-tmpl",headerContent,"#headerTitle");
         showBreadCrumb(entityType, uid, "chat")

         // footer rendering
         renderTemplate("#chatInput-tmpl",{},"footer");
         subsManager.isUpdatesSet();

         // render chat and keep .on() listening for coming messages
         DB.child("chats/"+uid+"/messages").orderByChild("dateAdded").limitToLast(20).on("child_added", chatsCallback);

         //listen to enter from input, should be called lastly.
         $("#chatInputTxt").keypress(function (e) {
            if (e.keyCode == 13) {
               e.preventDefault();
               addChatMessagePre(uid);
            }
         });
      });
   });
}


function addChatMessage(chatUid,userUid, text) {

   if (text != "") {

      //get user name
      DB.child("users/"+userUid).once("value", function(user) {
         var userName = user.val().name;

         DB.child("chats/"+chatUid+"/messages").push({dateAdded: firebase.database.ServerValue.TIMESTAMP, user: userUid, userName:userName, text: text, chatUid: chatUid});
      })
   }
}


function addChatMessagePre(chatUid) {

   var inputValue = $("#chatInputTxt").val();
   addChatMessage(chatUid, userUuid, inputValue);
   $("#chatInputTxt").val("");
}


function checkChatsUpdates(type, uid){
   //check last massage time
   DB.child("chats/"+uid+"/messages").orderByChild("dateAdded").limitToLast(1).on("child_added", function(dataSnapshot){
      console.log("last massage:", dataSnapshot.val());
   })
}


