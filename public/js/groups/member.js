function setMembership(){
  groupUid = activeEntity.uid;

  //check if a member already

  DB.child("groups/"+groupUid+"/members/"+userUuid).once("value", function(isMember){
    console.dir(isMember.val());
    if(isMember.val() == null){

      //set membership according to public/close/secert

      var groupTypeTemp = "";
      DB.child("groups/"+groupUid+"/type").once("value", function(dataSnapshot){

        groupTypeTemp = dataSnapshot.val()
        console.log("groupTypeTemp:", groupTypeTemp);

        if (groupTypeTemp == "public"){

          console.log("Turn on membership");
          DB.child("users/"+userUuid+"/membership/"+groupUid).set(true);
          DB.child("groups/"+groupUid+"/members/"+userUuid).update({role:"member", name: userName, email:userEmail, dateAdded: firebase.database.ServerValue.TIMESTAMP});

          $("#isMembership").css("color",activeColor);

        } else {
          //if group is secert or close, user must ask for membership
          DB.child("groups/"+groupUid+"/pendings/"+userUuid).update({name: userName, email: userEmail, photo: userPhoto, dateAdded: firebase.database.ServerValue.TIMESTAMP});
        }
      })

    } else {
      //if he is all ready a member
      var removeMembership = confirm("Are you sure you want to leave this group?")
      if (removeMembership){
        DB.child("users/"+userUuid+"/membership/"+groupUid).remove();
        DB.child("users/"+userUuid+"/updates/groups/"+groupUid+"/ownerCalls").remove();
        DB.child("groups/"+groupUid+"/members/"+userUuid).remove();
        $("#isMembership").css("color",inactiveColor);
      }
    }
  })
}

function isMembership(){
  groupUid = activeEntity.uid;

  DB.child("groups/"+groupUid+"/members/"+userUuid).once("value", function(isMembership){
    if(isMembership.val() != null){
      if (isMembership.val()){
        $("#isMembership").css("color",activeColor);
      } else {
        $("#isMembership").css("color",inactiveColor);
      }
    } else {
      $("#isMembership").css("color",inactiveColor);
    }
  });


}
