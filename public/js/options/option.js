function showOption(questionUid, optionUid){
   //show header
   DB.child("questions/"+questionUid+"/options/"+optionUid).once("value", function(dataSnapshot){
      var title = dataSnapshot.val().title;

      renderTemplate("#questionHeaderTitle-tmpl", {question: title}, "#headerTitle");
   })
   //show footer

   setActiveEntity("options", optionUid)

   //set active entity
}
