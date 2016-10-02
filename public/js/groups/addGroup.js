function showAddGroup(){

  $("#entitiesPanel").slideUp();
  renderTemplate("#createGroup-tmpl",{}, "wrapper");
  renderTemplate("#createGroupFooter-tmpl",{}, "footer")
}

function addNewGroup(){
  //check if form exists...

  //get form info
  groupName = $("#createGroupName").val();
  groupDescription = $("#createGroupDescription").val();
  groupType = $("input[name=type]:checked").val();

  if (groupName == "") {
    alert("חסר שם קבוצה");
    return;
  }

  if (userUuid == "" || userUuid == undefined) {
    alert("אנא התחבר/י למערכת");
    return;
  }


  var parentEntityType = activeEntity.entityType;
  var parentEntityUid = activeEntity.uid;
  var pubtype = false

  if(parentEntityType != "groups" && parentEntityType != "topics"){
    parentEntityType = "";
    parentEntityUid = "";
    if (groupType != "secret"){
      pubtype = true;
    }
  }

  var newGroup = DB.child("groups").push({
    dateAdded: firebase.database.ServerValue.TIMESTAMP,
    title: groupName,
    description: groupDescription,
    type:groupType,
    owner: userUuid,
    parentEntityType:parentEntityType,
    parentEntityUid: parentEntityUid,
    pubtype: pubtype
  });

  newGroup.child("members/"+userUuid).update({
    dateAdded: firebase.database.ServerValue.TIMESTAMP,
    email: userEmail,
    name: userName,
    photo: userPhoto,
    role: "owner"
  });

  if (parentEntityType == "groups"){
    DB.child("groups/"+parentEntityUid+"/subEntities/"+newGroup.key).set({entityType: "groups", dateAdded: firebase.database.ServerValue.TIMESTAMP, order:1 })
  }

  var groupRole= new Object;
  groupRole[newGroup.key] = "owner";

  DB.child("users/"+userUuid+"/role/"+newGroup.key).set("owner");

  showEntities(parentEntityType, parentEntityUid);

}
