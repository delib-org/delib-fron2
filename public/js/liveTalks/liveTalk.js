function showLiveTalk(liveTalkUid){
   //show header
   DB.child("liveTalks/"+liveTalkUid).once("value", function(data){
      var title = data.val().title;
      var parentEntityType = data.val().parentEntityType;
      var parentEntityUid = data.val().parentEntityUid;

      renderTemplate("#liveTalksHeaderTitle-tmpl", {title:title}, "#headerTitle");
      showBreadCrumb("topics", liveTalkUid, title);
      renderTemplate("#headerMenu-tmpl", {chatUid: liveTalkUid, entityType: "liveTalks"}, "#headerMenu");

      //show footer
      renderTemplate("#liveTalkFooter-tmpl",{liveTalkUid: liveTalkUid, entityType:parentEntityType, uid: parentEntityUid},"footer")

      //show wrapper
      $("wrapper").html("<div class='liveTalksWrapper'><div class='liveTalkColumn'><div id='"+liveTalkUid+"thumbsDown' class='ThumbDownColumn'></div></div><div class='liveTalkColumn'><div id='"+liveTalkUid+"thumbsUp' class='ThumbUpColumn'></div></div><div class='liveTalkColumn'>3</div><div class='liveTalkColumn'>4</div><div class='liveTalkColumn'>5</div></div>").css("overflow","hidden");
   })


   DB.child("liveTalks/"+liveTalkUid+"/thumbsDown/start").set(true);
   showThumbDown(liveTalkUid);
   showThumbUp(liveTalkUid);

   setActiveEntity("liveTalks", liveTalkUid);
}

function setThumbDown(liveTalkUid){

   DB.child("liveTalks/"+liveTalkUid+"/thumbsDown/"+userUuid).set(true);

   setTimeout(function(){
      DB.child("liveTalks/"+liveTalkUid+"/thumbsDown/"+userUuid).remove();
   },5000);
}

function showThumbDown(liveTalkUid){

   DB.child("liveTalks/"+liveTalkUid+"/thumbsDown").on("value", function(thumbsDown){


      var numberOfThumbsDown = thumbsDown.numChildren();

      $("#"+liveTalkUid+"thumbsDown").text(numberOfThumbsDown-1).height(numberOfThumbsDown*5);

   })
}

function setThumbUp(liveTalkUid){
   console.log("thumbUp")
   DB.child("liveTalks/"+liveTalkUid+"/thumbsUp/"+userUuid).set(true);

   setTimeout(function(){
      DB.child("liveTalks/"+liveTalkUid+"/thumbsUp/"+userUuid).remove();
   },5000);

}

function showThumbUp(liveTalkUid){

   DB.child("liveTalks/"+liveTalkUid+"/thumbsUp").on("value", function(thumbsDown){

      var numberOfThumbsDown = thumbsDown.numChildren();

      $("#"+liveTalkUid+"thumbsUp").text(numberOfThumbsDown-1).height(numberOfThumbsDown*5);

   })
}

