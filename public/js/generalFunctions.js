function getRandomColor() {
   var letters = '0123456789ABCDEF'.split('');
   var color = '#';
   for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
   }
   return color;
}

function parseDate(dateInMillisec){
   var d=new Date(dateInMillisec);

   var dayInMonth="0"+d.getDate();
   dayInMonth = dayInMonth.slice(-2);


   var month=d.getMonth();
   var monthsNames = ["ינואר", "פברואר", "מרץ", "ארפיל", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אור'", "נוב'", "דצמ'"];
   month = monthsNames[month];

   var year=d.getYear()+1900;

   var minutes="0"+d.getMinutes();
   minutes = minutes.slice(-2);

   var hours="0"+d.getHours();
   hours = hours.slice(-2);

   var seconds="0"+d.getSeconds();
   seconds = seconds.slice(-2);

   return (year+"-"+month+"-"+dayInMonth+" - "+hours+":"+minutes+":"+seconds);

}


function setAcitveEntity (newEntity, newUid, newEventType, newCallback){
   var previuosEntity = activeEntity.entity;
   var previuosUid = activeEntity.uid;
   var previuosEventType = activeEntity.eventType;
   var previuosCallback = activeEntity.callback;

   if (isNotEmpty(previuosUid) && previuosEntity !== "chats") {
      DB.child(previuosEntity+"/"+previuosUid).off();
   }

   activeEntity.entity = newEntity;
   activeEntity.uid = newUid;
   activeEntity.eventType = newEventType;
   activeEntity.callback = newCallback;

   subsManager.isUpdatesSet();
}

function animateHeader(){
   $("header").hide();
   $("header").show(400);
}

function isNotEmpty(variable){
   if (variable != null || variable != undefined || variable != "" ){
      return true;
   } else {
      return false;
   }
}

function back(){
   var entity = activeEntity.entity;

   switch (entity){
      case "groups":
         showOwnedGroups();
         break;
      case "topics":
         showGroup(activeEntity.uid);
         break;
      case "questions":
         showTopic(activeEntity.uid);
      default:
         showOwnedGroups();
   }
}

function entityTypeToHebrew (entityType){
   switch (entityType){
      case "groups":
         return "קבוצה";
         break;
      case "topics":
         return "נושא";
         break;
      case "questions":
         return "שאלה";
         break;
      default:
         console.log("unknowen entity");
         return undefined;
   }
}
//
// function setActiveEntity(entity, uid){
//
//    //close previous entity
//    DB.(activeEntity.entity+"/"+activeEntity.uid).off(activeEntity.eventType, activeEntity.callback);
//    //store new entity
//    activeEntity.uid = uid;
//    activeEntity.entity = entity;
//    activeEntity.callback = entitiesCallbacks.chats.callback;
//    activeEntity.eventType = entitiesCallbacks.chats.eventType;
//
// }


