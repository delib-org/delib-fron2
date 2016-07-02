function showAddGroup(){
  convertTemplate("#createGroup-tmpl",{}, "wrapper");
  convertTemplate("#createGroupFooter-tmpl",{}, "footer")
}

function addNewGroup(){
  //check if form exists...

  //get form info
  groupName = $("#createGroupName").val();
  groupDescription = $("#createGroupDescription").val();
  groupType = $("input[name=type]:checked").val();
  dateAdded=  
  console.log("name: " + groupName + ", group description: "+ groupDescription + ", type: " + groupType);

  if (groupName == "") {
    alert("חסר שם קבוצה");
    return;
  }

  if (userUuid == "" || userUuid == undefined) {
    alert("אנא התחבר/י למערכת");
    return;
  }



  var newGroup = DB.child("groups").push({dateAdded: firebase.database.ServerValue.TIMESTAMP, title: groupName, description: groupDescription, type:groupType, owner: userUuid });

  var groupRole= new Object;
  groupRole[newGroup.key] = "owner";

  DB.child("users/"+userUuid+"/role/"+newGroup.key).set("owner");

  showOwnedGroups();

}
