function openGroupMenu(groupUid){
  if ($("#groupMenu"+groupUid).is(':visible')){
    $("#groupMenu"+groupUid).hide(400);
  } else {
    $("#groupMenu"+groupUid).show(400);
  }
}

function groupSettings(groupUid){
  console.log("groupSettings")
  renderTemplate("#editGroup-tmpl",{uid:groupUid},"wrapper");
  openTab("settings", groupUid)
}

function groupsEdit(groupUid){

  renderTemplate("#createGroupSettings-tmpl",{uid:groupUid},"#editGroupPages");
  console.log("groupsEdit:", groupUid);
  

  renderTemplate("#editGroupFooter-tmpl", {groupUid:groupUid}, "footer");

  DB.child("groups/"+groupUid).once("value", function(dataSnapshot){
    var title = dataSnapshot.val().title;
    var description = dataSnapshot.val().description;
    var type = dataSnapshot.val().type;

    $("input[name=type][value=" + type + "]").attr('checked', 'checked');
    $("#createGroupName").val(title);
    $("#createGroupDescription").text(description);

  })
}

function updateGroupToDB(groupUid){
  var title=$("#createGroupName").val();
  var description = $("#createGroupDescription").val();

  DB.child("groups/"+groupUid).update({title:title, description:description });

  showEntities('groups', groupUid);

}

function openTab (page, groupUid){

  if(page == 'settings') {
//    renderTemplate("#createGroupSettings-tmpl",{},"#editGroupPages");
    groupsEdit(groupUid)
  } else {
    showAdminPanel(groupUid);
    console.log("openTab:", groupUid);
  }
}
