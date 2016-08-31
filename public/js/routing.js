function getUrl(){
   var currentUrl = window.location.href;
   var locationToCut = currentUrl.indexOf("?");
   currentUrl = currentUrl.substring(locationToCut+1);
   return currentUrl;

}

function routTo(currentUrl, back){

   // debugger;
   if (back == undefined){back = false}

   var slashPostion = currentUrl.indexOf("/");

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

function setActiveEntity (newEntity, newUid, newEventType, newCallback, turnOff) {
   // debugger;
   var previuosEntity = activeEntity.entity;
   var previuosUid = activeEntity.uid;
   var previuosEventType = activeEntity.eventType;
   var previuosCallback = activeEntity.callback;
   var previuosTurnOff = activeEntity.turnOff;

   if (previuosEntity != "main"){
      if (previuosEventType != undefined){
         if (previuosUid != undefined){
               previuosTurnOff();
            console.log(previuosEntity, previuosUid, previuosEventType, previuosTurnOff, turnOff);
         } else {
            console.log("Error: no previuos entity to close off previous callback");
         }
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
   activeEntity.previousEntity = previuosEntity;
   activeEntity.previousUid = previuosUid;
   activeEntity.uid = newUid;
   activeEntity.eventType = newEventType;
   activeEntity.callback = newCallback;
   activeEntity.turnOff = turnOff;
   activeEntity.previuosEntity = previuosEntity;
   // activeEntity.onObject = newOnObject;

   setUrl(newEntity, newUid);

   if (newEntity == "chats")
      DB.child(previuosEntity+"/"+newUid).once("value", function (dataSnapshot){
         // console.log(dataSnapshot.val());
         document.title = "דליב: " + entityTypeToHebrew(newEntity) + " - " +dataSnapshot.val().title;
      });
   
   if (newEntity == "groups" || newEntity == "topics" || newEntity == "questions"){
      DB.child(newEntity+"/"+newUid).once("value", function (dataSnapshot){
         // console.log(dataSnapshot.val());
         document.title = "דליב: " + entityTypeToHebrew(newEntity) + " - " +dataSnapshot.val().title;
      })
   } else {
      document.title = "דליב (ראשי) : מחליטים ביחד";
   }


   $("#entitiesPanel").slideUp(400);

   var currentEntity = activeEntity.uid;


   DB.child(activeEntity.entity + '/' + activeEntity.uid + '/title').once('value',function(dataSnap){

      console.log('previous entity', activeEntity.previousEntity);
      console.log('previous uid', activeEntity.previousUid);
      console.log('datasnap', dataSnap.val())
      console.log('current uid', currentEntity)
      return dataSnap

   }).then(function(res){
      DB.child(activeEntity.previousEntity +'/'+activeEntity.previousUid+'/title').once('value', function(dataSnap){
         renderTemplate('#headerBreadCrumbs-tmpl',{
            previousEntity:activeEntity.previousEntity,
            previousUid:activeEntity.previousUid,
            currentUid:activeEntity.uid,
            currentTitle:res.val(),
            currentEntity:activeEntity.entity,
            previousTitle:dataSnap.val()
         },'#headerBreadCrumbs')
      })
   })


}

function showEntities(entity, uid){

   switch (entity){
      case "groups":
         DB.child("groups/"+uid).once("value", function (group){
            if(group.exists()){
               showGroup(uid);
            } else {
               console.log("group "+uid+" do not exist");
               showMain("public");
            }
         })
         break;
      case "topics":
         DB.child("topics/"+uid).once("value", function (topic){
            if (topic.exists()){
               showTopic(uid);
            } else {
               console.log("topic "+uid+" do not exist");
               showMain("public");
            }
         })
         break;
      case "questions":
         DB.child("questions/"+uid).once("value", function (question){
            if (question.exists()){
               showQuestion(uid);
            } else {
               console.log("question "+uid+" do not exist");
               showMain("public");
            }
         })
         break;
      case "chats":
         DB.child("chats/"+uid).once("value", function (question){
            if (question.exists()){
               showChat(uid);
            } else {
               console.log("question "+uid+" do not exist");
               showMain("public");
            }
         })
         break;
      case "main":
         showMain(uid);
         break;
      case "options":
         DB.child("options/"+uid).once("value", function(dataSnapshot){
            if (question.exists()){
               var questionUid = dataSnapshot.val().questionUid;
               var optionUid = dataSnapshot.val().optionUid;
               console.log(questionUid, optionUid);
               showOption(questionUid,optionUid);
            } else {
               console.log("option "+uid+" do not exist");
               showMain("public");
            }
         })
         break;
      default:
         showMain("public");
   }

};

