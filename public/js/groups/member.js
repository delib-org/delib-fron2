function membership(){
  groupUid = activeEntity.uid;

  DB.child("users/"+userUuid+"/membership/"+groupUid).once("value", function(isMembership){
    if(isMembership.val() != null){

      if (isMembership.val()){
        DB.child("users/"+userUuid+"/membership/"+groupUid).remove();
        DB.child("users/"+userUuid+"/updates/groups/"+groupUid+"/ownerCalls").remove();
        $("#isMembership").css("color",inactiveColor);
      } else {
        DB.child("users/"+userUuid+"/membership/"+groupUid).set(true);
        DB.child("users/"+userUuid+"/updates/groups/"+groupUid+"/ownerCalls").set(true);
        $("#isMembership").css("color",activeColor);
      }
    } else {
      DB.child("users/"+userUuid+"/membership/"+groupUid).set(true);
      $("#isMembership").css("color",activeColor);
    }
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
  })
}
