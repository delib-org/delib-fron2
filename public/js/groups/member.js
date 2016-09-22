function setMembership(){
  groupUid = activeEntity.uid;
  var groupTypeTemp = "";
  DB.child("groups/"+groupUid+"/type").once("value", function(dataSnapshot){

    groupTypeTemp = dataSnapshot.val()
    console.log("groupTypeTemp:", groupTypeTemp);

    DB.child("users/"+userUuid+"/membership/"+groupUid).once("value", function(isMembership){
      if(isMembership.val() != null){
        console.log("Turn off membership");
        if (isMembership.val()){
          DB.child("users/"+userUuid+"/membership/"+groupUid).remove();
          DB.child("users/"+userUuid+"/updates/groups/"+groupUid+"/ownerCalls").remove();

          if (groupTypeTemp == "public"){
            DB.child("groups/"+groupUid+"/members/"+userUuid).remove();
          } else{
            DB.child("groups/"+groupUid+"/pendings/"+userUuid).remove();
          }

          $("#isMembership").css("color",inactiveColor);
        } else {
          DB.child("users/"+userUuid+"/membership/"+groupUid).set(true);
          DB.child("users/"+userUuid+"/updates/groups/"+groupUid+"/ownerCalls").set(true);
          $("#isMembership").css("color",activeColor);
        }
      } else {
        console.log("Turn on membership");
        DB.child("users/"+userUuid+"/membership/"+groupUid).set(true);
        if (groupTypeTemp == "public"){
          DB.child("groups/"+groupUid+"/members/"+userUuid).update({role:"member", name: userName, email:userEmail, dateAdded: firebase.database.ServerValue.TIMESTAMP});
        } else{
          DB.child("groups/"+groupUid+"/pendings/"+userUuid).update({role:"Asking", name: userName, email:userEmail, dateAdded: firebase.database.ServerValue.TIMESTAMP});
        }
        $("#isMembership").css("color",activeColor);
      }
    })

  })


}

function isMembership(){
  groupUid = activeEntity.uid;

  DB.child("users/"+userUuid+"/membership/"+groupUid).once("value", function(isMembership){
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
