function showLiveTalk(liveTalkUid){
   //show header
   DB.child("liveTalks/"+liveTalkUid).once("value", function(data){
      var title = data.val().title;
      var parentEntityType = data.val().parentEntityType;
      var parentEntityUid = data.val().parentEntityUid;

      renderTemplate("#liveTalksHeaderTitle-tmpl", {title:title}, "#headerTitle");

      //show footer
      renderTemplate("#liveTalkFooter-tmpl",{entityType:parentEntityType, uid: parentEntityUid},"footer")
   })


   //show wrapper
}
