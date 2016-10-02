function setMembership(){
  groupUid = activeEntity.uid;

  //check if a member already

  DB.child("groups/"+groupUid+"/members/"+userUuid).once("value", function(isMember){

    if(isMember.val() == null){

      //set membership according to public/close/secert

      var groupTypeTemp = "";
      DB.child("groups/"+groupUid+"/type").once("value", function(dataSnapshot){

        groupTypeTemp = dataSnapshot.val();

        if (groupTypeTemp == "public"){

          console.log("Turn on membership");
          DB.child("users/"+userUuid+"/membership/"+groupUid).set(true);
          DB.child("groups/"+groupUid+"/members/"+userUuid).update({role:"member", name: userName, email:userEmail, dateAdded: firebase.database.ServerValue.TIMESTAMP});

          $("#isMembership").css("color",activeColor);

        } else {
          //if group is secert or close, user must ask for membership
          var userPendingDB = DB.child("groups/"+groupUid+"/pendings/"+userUuid);

          userPendingDB.once("value", function(pendingData){
            if (pendingData.val() != null){
              userPendingDB.remove();
              $("#isMembership").css("color",inactiveColor);
            } else {
              userPendingDB.update({name: userName, email: userEmail, photo: userPhoto, dateAdded: firebase.database.ServerValue.TIMESTAMP});
              //set "haert" to orange
              $("#isMembership").css("color",pendingColor);
            }
          })





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

var checkMembershipCallback;

function isMembership(groupUid){

  //check pending
  DB.child("groups/"+groupUid+"/pendings/"+userUuid).on("value", function(isMembership){
    if(isMembership.val() != null){
      if (isMembership.val()){
        $("#isMembership").css("color",pendingColor);      }
    } else {
      //check membership
      DB.child("groups/"+groupUid+"/members/"+userUuid).on("value", checkMembershipCallback = function(isMembership){
        if(isMembership.val() != null){
          if (isMembership.val()){
            $("#isMembership").css("color",activeColor);
          } else {
            $("#isMembership").css("color",inactiveColor);
          }
        } else {
          $("#isMembership").css("color",inactiveColor);
        }
      })
    };
  })
}


