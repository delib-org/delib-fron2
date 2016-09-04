function liveTalksEdit(liveTalkUid){
   ShowLiveTalkEditScreen(liveTalkUid)
}

function ShowLiveTalkEditScreen(liveTalkUid){

   renderTemplate("#editLiveTalk-tmpl",{}, "wrapper");
   renderTemplate("#liveTalkFooter-tmpl",{}, "footer");
   $("#entitiesPanel").slideUp();

   if(liveTalkUid != undefined && liveTalkUid != ""){
      DB.child("liveTalks/"+liveTalkUid).once("value", function(data){


         var title = data.val().title;
         var description = data.val().description;

         $("#liveTalkName").val(title);
         $("#liveTalkDescription").val(description)


      })
   }
}

function setLiveTalkToDb(){

   var liveTalkTitle = $("#liveTalkName").val()
   var liveTalkDescription = $("#liveTalkDescription").val()

   if (liveTalkTitle == ""){
      alert("Talk must have a name");
      return
   }

   //create DB entry

   var newLiveTalDB = DB.child(activeEntity.entityType+"/"+activeEntity.uid+"/subEntities").push({title: liveTalkTitle, description: liveTalkDescription, entityType:"liveTalks", order:"1", dateAdded: firebase.database.ServerValue.TIMESTAMP});

   DB.child("liveTalks/"+ newLiveTalDB.key).set({title: liveTalkTitle, description: liveTalkDescription, parentEntityType: activeEntity.entityType, parentEntityUid: activeEntity.uid})

   showEntities(activeEntity.entityType, activeEntity.uid);
}

