function showAddTopicScreen(){

   $("#entitiesPanel").slideUp();
   renderTemplate("#createTopic-tmpl",{}, "wrapper");
   renderTemplate("#createTopicFooter-tmpl",{}, "footer")
}

function addNewTopic(){
   topicName = $("#createTopicName").val();
   topicDescription = $("#createTopicDescription").val();

   if (topicName == "") {
      alert("חסר שם נושא");
      return;
   }

   if (userUuid == "" || userUuid == undefined) {
      alert("אנא התחבר/י למערכת");
      return;
   }

   var parentEntityType = activeEntity.entityType;
   var parentEntityUid = activeEntity.uid;

   var newTopic = DB.child("topics").push({dateAdded: firebase.database.ServerValue.TIMESTAMP, title: topicName, description: topicDescription, owner: userUuid, parentEntityType:parentEntityType, parentEntityUid: parentEntityUid });

//   if (activeEntity.entityType == "groups"){
//      var group = activeEntity.uid;      DB.child("groups/"+group+"/topics/"+newTopic.key+"/dateAdded").set(firebase.database.ServerValue.TIMESTAMP);
//   }



   DB.child(parentEntityType+"/"+parentEntityUid+"/subEntities/"+newTopic.key).set({entityType: "topics", dateAdded: firebase.database.ServerValue.TIMESTAMP, order:1 })

   DB.child("users/"+userUuid+"/topics/"+newTopic.key).set("owner");

   showEntities(activeEntity.entityType,activeEntity.uid);
}
