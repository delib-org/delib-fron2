function getUrl(){  
   var currentUrl = window.location.href;
   var locationToCut = currentUrl.indexOf("?");
   currentUrl = currentUrl.substring(locationToCut+1);
   return currentUrl;

}

function routTo(currentUrl, back){

   if (back == undefined){back = false};

   var slashPostion = currentUrl.indexOf("/");
   //   var currentType = sessionStorage.getItem("_entityType");
   //   var currentEntity = sessionStorage.getItem("_currentEntity");

   var currentType = currentUrl.slice(0,slashPostion);
   var currentEntity = currentUrl.slice(slashPostion+1);

   showEntities(currentType, currentEntity);

}

function setUrl(type, uid){
   //get domain
   var currentUrl = window.location.href;
   var locationToCut = currentUrl.indexOf("?");
   var domainUrl = currentUrl.slice(0,locationToCut);

   if(type == undefined || uid == undefined){
      history.pushState({}, uid, domainUrl );
   } else{

      var typeEntity = {type: type, entity: uid};

      var url = domainUrl+"?"+type+"/"+uid;
      if(locationToCut >=0 && url!=currentUrl) {
        history.pushState(typeEntity, uid, url );
      } else {
        history.replaceState(typeEntity, uid, url );
      }
   }
};

function setActiveEntity (newEntity, newUid, newEventType, newCallback, turnOffFunction){

   var previuosEntity = activeEntity.entity;
   var previuosUid = activeEntity.uid;
   var previuosEventType = activeEntity.eventType;
   var previuosCallback = activeEntity.callback;
   var previuosTurnOffFunction = activeEntity.turnOffFunction;

   if (previuosEntity != "main"){
      if (previuosEventType != ""){
         if (isNotEmpty(previuosUid)){
            DB.child(previuosEntity+"/"+previuosUid).off(previuosEventType, previuosCallback);
         } else {
            console.log("Error: no previuos entity to close off previous callback");
         }
      } else {
         previuosTurnOffFunction();
      }
   } else {
      switch (previuosUid){
         case "member":
         case "owned":
            DB.child("users/"+userUuid+"/role").off(previuosEventType, previuosCallback);
            break;
         case "public":
            DB.child("groups").off(previuosEventType, previuosCallback);
            break;
         default:
            console.log("Error: no such groups cluster in main ("+previuosUid+")");
      }
   }


   activeEntity.entity = newEntity;
   activeEntity.uid = newUid;
   activeEntity.eventType = newEventType;
   activeEntity.callback = newCallback;
   activeEntity.turnOffFunction = turnOffFunction;

   setUrl(newEntity, newUid);
   if (newEntity == "groups" || newEntity == "topics" || newEntity == "questions" || newEntity == "chats"){
      DB.child(newEntity+"/"+newUid).once("value", function (dataSnapshot){
         var entetisTranslate = {groups: "קהילה" , topics: "נושא" , questions: "שאלה", chats: "שיחה" }

         document.title = "דליב: "+entetisTranslate[newEntity] + " - " +dataSnapshot.val().title
      })
   } else {
      document.title = "דליב (ראשי) : מחליטים ביחד";
   }
}

function showEntities(entity, uid){

   switch (entity){
      case "groups":
         DB.child("groups/"+uid).once("value", function (group){
            if(group.exists()){
               showGroup(uid);
            } else { console.log("group "+uid+" do not exist"); }
         })
         break;
      case "topics":
         DB.child("topics/"+uid).once("value", function (topic){
            if (topic.exists()){
               showTopic(uid);
            } else { console.log("topic "+uid+" do not exist");}
         })
         break;
      case "questions":
         DB.child("questions/"+uid).once("value", function (question){
            if (question.exists()){
               showQuestion(uid);
            } else { console.log("question "+uid+" do not exist");}
         })
         break;
      case "chats":
         DB.child("chats/"+uid).once("value", function (question){
            if (question.exists()){
               showChat(uid);
            } else { console.log("question "+uid+" do not exist");}
         })
         break;
      case "main":
         showMain(uid);
         break;
      default:
         showMain("public");
   }
};

