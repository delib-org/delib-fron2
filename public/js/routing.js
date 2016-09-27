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
   var previuosEntityType = activeEntity.entityType;
   var previuosUid = activeEntity.uid;
   var previuosEventType = activeEntity.eventType;
   var previuosCallback = activeEntity.callback;
   var previuosTurnOff = activeEntity.turnOff;

   activeEntity.previuosEntity = previuosEntityType;
   activeEntity.previuosUid = previuosUid;

   checkChatsUpdates(newEntity, newUid);


     if (previuosEntityType != "main"){
        if (previuosEventType != undefined){
           if (previuosUid != undefined){
              previuosTurnOff();
           } else {
              console.log("Error: no previuos entity to close off previous callback");
           }
        } else if( previuosEventType == "feed")
           feedManager.queue = [];
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

   activeEntity.entityType = newEntity;
   activeEntity.uid = newUid;
   activeEntity.eventType = newEventType;
   activeEntity.callback = newCallback;
   activeEntity.turnOff = turnOff;
   //activeEntity.previuosEntityType = previuosEntityType;


   setUrl(newEntity, newUid);

   if (newEntity == "chats")
      DB.child(previuosEntityType+"/"+newUid).once("value", function (dataSnapshot){

         document.title = "דליב: " + entityTypeToHebrew(newEntity) + " - " +dataSnapshot.val().title;
      });

   if (newEntity == "groups" || newEntity == "topics" || newEntity == "questions"){
      DB.child(newEntity+"/"+newUid).once("value", function (dataSnapshot){

         document.title = "דליב: " + entityTypeToHebrew(newEntity) + " - " +dataSnapshot.val().title;
      })
   } else {
      document.title = "דליב (ראשי) : מחליטים ביחד";
   }


   $("#entitiesPanel").slideUp(400);

   var currentEntity = activeEntity.uid;

   showNumberOfFeeds();
}

function showEntities(entity, uid){

   $("wrapper").css("overflow","auto");
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
               var entityType = question.val().entity.typeInDB;
               showChat(entityType, uid);
            } else {
               console.log("question "+uid+" do not exist");
               showMain("public");
            }
         })
         break;
      case "liveTalks":
         DB.child("liveTalks/"+uid).once("value", function (question){
            if (question.exists()){
               showLiveTalk(uid);
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

function showBreadCrumb(entityType, uid, title){
   //get all parents of an entity (by settin it's type and uid)

   //child

   //var parentsArray = [{entityType: entityType, uid: uid, title:title, symbol: symbols[entityType]}];
   var parentsArray = new Array();
   //get parent 1
   DB.child(entityType+"/"+uid).once("value", function(dataP1){

      if (dataP1.val() != null && dataP1.val().parentEntityType != undefined){
         var parent1Type = dataP1.val().parentEntityType;
         var parent1Uid = dataP1.val().parentEntityUid;
         var parent1Symbol = symbols[parent1Type];


         parentsArray.push({entityType: parent1Type, uid: parent1Uid, symbol: parent1Symbol});

         var preContext = parentsArray;

         var context= {path: preContext}
         renderTemplate("#headerBreadCrumbs-tmpl",context,"#headerBreadCrumbs");


         //check if the parent have parent..

         DB.child(parent1Type+"/"+parent1Uid).once("value", function(dataP2){

            parentsArray[0].title = dataP2.val().title;

            if (dataP2.val() != null && dataP2.val().parentEntityType != undefined){
               //get parent1 title

               var preContext = parentsArray;

               var context= {path: preContext}

               renderTemplate("#headerBreadCrumbs-tmpl",context,"#headerBreadCrumbs");

               //get parent2 uid and type
               var parent2Type = dataP2.val().parentEntityType;
               var parent2Uid = dataP2.val().parentEntityUid;
               var parent2Symbol = symbols[parent2Type];


               parentsArray.push({entityType: parent2Type, uid: parent2Uid, symbol: parent2Symbol});

               DB.child(parent2Type+"/"+parent2Uid).once("value", function(dataP3){
                  if (dataP3.val() != null){
                     parentsArray[1].title = dataP3.val().title;

                     var preContext = parentsArray;
                     preContext.reverse();
                     var context= {path: preContext}
                     renderTemplate("#headerBreadCrumbs-tmpl",context,"#headerBreadCrumbs")

                  }
               })
            } else {

               parentsArray.reverse();
               var context= {path: parentsArray}
               renderTemplate("#headerBreadCrumbs-tmpl",context,"#headerBreadCrumbs")
            }

         })
      } else {

         var context= {path: parentsArray}
         renderTemplate("#headerBreadCrumbs-tmpl",context,"#headerBreadCrumbs")
      }
   })



}
