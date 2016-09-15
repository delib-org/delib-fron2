function showLiveTalk(liveTalkUid){
   //show header
   DB.child("liveTalks/"+liveTalkUid).once("value", function(data){
      var title = data.val().title;
      var parentEntityType = data.val().parentEntityType;
      var parentEntityUid = data.val().parentEntityUid;

      renderTemplate("#liveTalksHeaderTitle-tmpl", {title:title}, "#headerTitle");
      showBreadCrumb("topics", liveTalkUid, title);
      renderTemplate("#headerMenu-tmpl",{type:"liveTalks", uid:liveTalkUid},"#headerMenu");

      //show footer
      renderTemplate("#liveTalkFooter-tmpl",{liveTalkUid: liveTalkUid, entityType:parentEntityType, uid: parentEntityUid},"footer")

      //show wrapper
      $("wrapper").html("<div class='liveTalksWrapper'><div class='liveTalkColumn'><div id='"+liveTalkUid+"thumbsDown' class='ThumbDownColumn'></div></div><div class='liveTalkColumn'><div id='"+liveTalkUid+"thumbsUp' class='ThumbUpColumn'></div></div><div class='liveTalkColumn'><div id='"+liveTalkUid+"stayFocused' class='ThumbUpColumn'></div></div><div class='liveTalkColumn'>4</div><div class='liveTalkColumn'>5</div></div>").css("overflow","hidden");
   })


//   DB.child("liveTalks/"+liveTalkUid+"/thumbsDown/start").set(true);
   showThumbDown(liveTalkUid);
   showThumbUp(liveTalkUid);
   showStayFocused(liveTalkUid);

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

   DB.child("liveTalks/"+liveTalkUid+"/thumbsDown").on("child_added", function(thumbDown){
      playCough();
   })
}

function setThumbUp(liveTalkUid){

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

   DB.child("liveTalks/"+liveTalkUid+"/thumbsUp").on("child_added", function(thumbUp){
      playCheer();
   })

}

function setStayFocused(liveTalkUid){

   DB.child("liveTalks/"+liveTalkUid+"/stayFocused/"+userUuid).set(true);

   setTimeout(function(){
      DB.child("liveTalks/"+liveTalkUid+"/stayFocused/"+userUuid).remove();
   },9000);

}

function showStayFocused(liveTalkUid){

   DB.child("liveTalks/"+liveTalkUid+"/stayFocused").on("value", function(thumbsDown){

      var numberOfThumbsDown = thumbsDown.numChildren();

      $("#"+liveTalkUid+"stayFocused").text(numberOfThumbsDown-1).height(numberOfThumbsDown*5).css("background-color", "orange");

   })

   DB.child("liveTalks/"+liveTalkUid+"/stayFocused").on("child_added", function(thumbUp){
       playCough();
   })

}


