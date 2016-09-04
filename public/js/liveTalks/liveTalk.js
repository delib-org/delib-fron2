function showLiveTalk(liveTalkUid){
   //show header
   DB.child("liveTalks/"+liveTalkUid).once("value", function(data){
      var title = data.val().title;
      var parentEntityType = data.val().parentEntityType;
      var parentEntityUid = data.val().parentEntityUid;

      renderTemplate("#liveTalksHeaderTitle-tmpl", {title:title}, "#headerTitle");

      //show footer
      renderTemplate("#liveTalkFooter-tmpl",{liveTalkUid: liveTalkUid, entityType:parentEntityType, uid: parentEntityUid},"footer")
      console.log("lt: "+ liveTalkUid)
      //show wrapper
      $("wrapper").html("<div class='liveTalksWrapper'><div class='liveTalkColumn'><div id='"+liveTalkUid+"thumbsDown' class='ThumbDownColumn'></div></div><div class='liveTalkColumn'>2</div><div class='liveTalkColumn'>3</div><div class='liveTalkColumn'>4</div><div class='liveTalkColumn'>5</div></div>");
   })


   DB.child("liveTalks/"+liveTalkUid+"/thumbsDown/start").set(true);
   showThumbDown(liveTalkUid);

   setActiveEntity("liveTalks", liveTalkUid);
}

function setThumbDown(liveTalkUid){

   DB.child("liveTalks/"+liveTalkUid+"/thumbsDown/"+userUuid).set(true);

   setTimeout(function(){
      DB.child("liveTalks/"+liveTalkUid+"/thumbsDown/"+userUuid).remove();
   },5000);
}

function showThumbDown(liveTalkUid){
   console.log("start:", liveTalkUid)
   DB.child("liveTalks/"+liveTalkUid+"/thumbsDown").on("value", function(thumbsDown){
      console.log("changed")
      var numberOfThumbsDown = thumbsDown.numChildren();
      console.log(numberOfThumbsDown)
      $("#"+liveTalkUid+"thumbsDown").text(numberOfThumbsDown-1).height(numberOfThumbsDown*5);

   })
}


