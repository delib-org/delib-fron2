function openGroupMenu(groupUid){
  if ($("#groupMenu"+groupUid).is(':visible')){
    $("#groupMenu"+groupUid).hide(400);
  } else {
    $("#groupMenu"+groupUid).show(400);
  }
}

function groupsEdit(groupUid){

  renderTemplate("#createGroup-tmpl",{uid:groupUid},"wrapper");
  console.log("groupsEdit:", groupUid)
  openTab('settings',groupUid);

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

  showOwnedGroups();

}
