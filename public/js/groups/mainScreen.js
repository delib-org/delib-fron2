//comment
const groupsDB = DB.child("groups");

function showMain(groupsCluster){
  //show header

  renderTemplate("#LogoHeaderTitle-tmpl",{},"#headerTitle");
  renderTemplate("#headerBreadCrumbs-tmpl",{},"#headerBreadCrumbs");
  renderTemplate("#headerMenu-tmpl",{},"#headerMenu");
  $("#globalNotificationsSub").css("color", inactiveColor);

  //show footer

  renderTemplate("#mainFooter-tmpl", {}, "footer");

  var borderColor = "4px solid rgba(44, 44, 44, 0.78)"
  switch (groupsCluster){
    case "public":
      showPublicGroups();
      $("#publicBtn").css("border",borderColor );
      break;
    case "owned":
      showOwnedGroups();
      $("#ownedBtn").css("border", borderColor);
      break;
    case "member":
      showMemberGroups();
      $("#memberBtn").css("border", borderColor);
      break;
    default:
      showPublicGroups();
      $("#publicBtn").css("border", "4px solid rgba(44, 44, 44, 0.65)");
  };

  subsManager.isUpdatesSet();
}

function showMemberGroups(){

  var memberGroupsCallback = function(groups){

    var groupsUnderMebership = groups.val();

    if (groupsUnderMebership != null){
      var numberOfGroups = Object.keys(groupsUnderMebership).length;

      var preContext = new Object();
      var groupsArray = new Array();
      //    var numberOfGroups;

      var i = 1;

      groups.forEach(function(group){

        //get group details
        DB.child("groups/"+group.key).once("value",function(groupDB){
          if (groupDB.val() != null){

            var title = groupDB.val().title;
            var description = groupDB.val().description;

            preContext = {
              uuid: group.key,
              title: title,
              description: description
            };
            groupsArray.push(preContext);
          } else {
            DB.child("users/"+userUuid+"/membership/"+group.key).remove();

          }

          if (numberOfGroups == i){
            var context = {groups: groupsArray};

            renderTemplate("#groupsGeneral-tmpl", context, "wrapper");
          }
          i++;
        })

      });
    } else {
      console.log("user is ont member in groups");
      renderTemplate("#groupsGeneral-tmpl", {}, "wrapper");
    }
  };

  DB.child("users/"+userUuid+"/membership").once("value", memberGroupsCallback);

  setActiveEntity("main", "member", undefined);



}

function showPublicGroups(){

  listenToGeneralGroups("public");


}

function showOwnedGroups(){

  listenToOwned_MemberGroups("owner");

}

function stopListeningToPageDB (page){

}

function listenToGeneralGroups (typeOfGroup){
  //typeOfGroup: secret, public, close

  var publicGroups = function(groups){
    var groupsArray = new Array();
    var groupsDetails = new Object();

    groups.forEach(function(group){

      var newGroup = group.val();
      if (newGroup.parentEntityUid == ""){
        var preContext = {
          "uuid": group.key,
          "title": newGroup.title,
          "description": newGroup.description
        };

        groupsArray.push(preContext);
      }
    });

    var context = {"groups": groupsArray}

    renderTemplate("#groupsGeneral-tmpl", context, "wrapper")
    $("wrapper").hide().fadeIn();

  }

  groupsDB.orderByChild("pubtype").equalTo(true).on("value", publicGroups);

  var turnOff = function () {
     groupsDB.orderByChild("pubtype").equalTo(true).off("value", publicGroups);
   };


  setActiveEntity("main", "public", turnOff);
}

function listenToOwned_MemberGroups (role){
  //role: owned, member

  if (role == "owner" || role == "member"){


    var userDB = DB.child("users/"+userUuid);

    var groupsOwnedMemberCallback = function(groupsUnderRole){

      if(groupsUnderRole.exists()){

        var groupsArray = new Array();

        //start counting the number of groups.
        var groupsUnderRoleLng = groupsUnderRole.val();

        var numberOfGroups = Object.keys(groupsUnderRoleLng).length;

        var i = 1;
        groupsUnderRole.forEach(function(groupOwned){

          var isGroupOwned = groupOwned.val();

          var preContext = new Object();

          DB.child("groups/"+groupOwned.key).once("value", function(data){

            if (data.val() != null){

              var title = data.val().title;
              var description = data.val().description;

              preContext = {
                uuid: groupOwned.key,
                title: title,
                description: description
              }

              groupsArray.push(preContext);

              if (i === numberOfGroups){

                var context = {groups: groupsArray};

                renderTemplate("#groups_"+role+"-tmpl", context, "wrapper");
                $(".cardsTopicsSubmenuDotsMenu").hide();
              }
            } else {
              console.log("Error: group "+groupOwned.key+" do not exists. Erasing from owner");
              DB.child("users/"+userUuid+"/role/"+groupOwned.key).remove();
            }
            i++;
          })
        })
      } else {
        console.log("groups don't exists");
        renderTemplate("#groups_"+role+"-tmpl", {}, "wrapper");
      }
    };

    //update groups details every time the user changes his groups
    userDB.child("role").orderByValue().equalTo(role).on("value", groupsOwnedMemberCallback);

    var turnOff = function () {
     userDB.child("role").orderByValue().equalTo(role).off("value", groupsOwnedMemberCallback);
   };

    setActiveEntity("main", "owned", turnOff);

  } else {console.log("type of role is not recognized")}
}

function showUserGroups(){

  var context = {"groups": groupsArray};

  renderTemplate("#groupsMember-tmpl", context,"wrapper" )

}

$("#btnAddGroup").click(function(){
  //showCreateGroupPopup();
  renderTemplate("#groupsOwned-tmpl",{},"#createGroupPopup");
  alert("creating");
});

function showCreateGroupPopup(){
  renderTemplate("#createGroupPopup-tmpl",{},"#createGroupPopup");
}


var userGroupsArray = new Array();
var memberContext = new Object();


function goHome(){
  $("#notificationsSub").css("color", inactiveColor)
  showPublicGroups();
  renderTemplate("#LogoHeaderTitle-tmpl",{}, "#headerTitle");
}

function setHomeGroups(){
  //check if groups are home groups and set an index for that

  DB.child("groups").once("value",function(dataSnapshot){
    dataSnapshot.forEach(function(dataSnap){
      if(dataSnap.val().parentEntityUid == "" && dataSnap.val().type != "secret"){
        DB.child("groups/"+dataSnap.key+"/pubtype").set(true);
      } else {
        DB.child("groups/"+dataSnap.key+"/pubtype").set(false);
      }
    })
  })

}
