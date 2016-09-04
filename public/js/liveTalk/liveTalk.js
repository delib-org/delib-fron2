function ShowLiveTalkEditScreen(liveTalkUid){
   renderTemplate("#editLiveTalk-tmpl",{}, "wrapper");
   renderTemplate("#liveTalkFooter-tmpl",{}, "footer");
   $("#entitiesPanel").slideUp();
}

function setLiveTalkToDb(){

   var liveTalkTitle = $("#liveTalkName").val()
   var liveTalkDescription = $("#liveTalkDescription").val()

   if (liveTalkTitle == ""){
      alert("Talk must have a name");
      return
   }

   //create DB entry

   var newLiveTalDB = DB.child(activeEntity.entityType+"/"+activeEntity.uid+"/subEntities").push({title: liveTalkTitle, description: liveTalkDescription, entityType:"liveTalk", order:"1", dateAdded: firebase.database.ServerValue.TIMESTAMP});

   DB.child("liveTalk/"+ newLiveTalDB.key).set({title: liveTalkTitle, description: liveTalkDescription, parentEntityType: activeEntity.entityType, parentEntityUid: activeEntity.uid})

}

