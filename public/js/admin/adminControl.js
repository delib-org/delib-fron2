var pendingTableCallback;
var membersTableCallback;
var promise1;
var promise2;

function showAdminPanel(groupUid){
  renderTemplate("#adminControl-tmpl",{},"#editGroupPages");

  //Pending Table
  DB.child("groups/"+groupUid+"/pendings").on("value", pendingTableCallback = function(pendings){
    console.log("panding changed")
    var preContext = [];
    if(pendings.val() !== null){
      pendings.forEach(function(pending){

        var dateAskedFor = parseDate(pending.val().dateAdded,"DDMMYY");

        preContext.push({name: pending.val().name, email: pending.val().email, date: dateAskedFor, uid:pending.key, groupUid:groupUid})
      });
      var context = {pendings: preContext};

      renderTemplate("#adminControlPending-tmpl",context, "#pendingMembersTable")
    } else {
      console.log("No pending members");
      $("#pendingMembersTable").html("");
    }

    promise1 = Promise.resolve(true);
  });

  //Members Table
  DB.child("groups/"+groupUid+"/members").on("value", membersTableCallback = function(members){

    var preContext = [];
    if(members.val() !== null){
      members.forEach(function(member){

        var dateAskedFor = parseDate(member.val().dateAdded,"DDMMYY");

        preContext.push({name: member.val().name, email: member.val().email, date: dateAskedFor, groupUid:groupUid, memberUid: member.key})
      });
      var context = {members: preContext}

      renderTemplate("#adminControlMembers-tmpl",context, "#CurrentMembersTable")
    } else {
      console.log("No members in group");
      $("#CurrentMembersTable").text("There arn't any members in the group")
    }

    promise2 = Promise.resolve(true);

  });

  Promise.all([promise1, promise2]).then(function() {
    var turnOff = function () {
      DB.child("groups/"+groupUid+"/pendings").off("value", pendingTableCallback);
      DB.child("groups/"+groupUid+"/members").off("value", membersTableCallback);
      console.log("turnOff function:"+pendingTableCallback,membersTableCallback)
    };

    setActiveEntity("adminControl", undefined, undefined, undefined, turnOff);
  });


}

function approveMember(groupUid, memberUid, isCofirmed){
  console.log("moving:",groupUid, memberUid, isCofirmed)
  if(isCofirmed == undefined){ isCofirmed = false};

  if (isCofirmed){
    var pendingRef = DB.child("groups/"+groupUid+"/pendings/"+memberUid);
    var memberRef = DB.child("groups/"+groupUid+"/members/"+memberUid);

    moveFbRecord(pendingRef, memberRef);
    DB.child("users/"+memberUid+"/membership/"+groupUid).set(true);

  } else {
    DB.child("groups/"+groupUid+"/pendings/"+memberUid).remove();
    DB.child("users/"+memberUid+"/membership/"+groupUid).remove();
  }
  showAdminPanel(groupUid);
}

function removeMember(groupUid, memberUid, userName){
  var confirmRemove = confirm("Are you sure you want to remove user "+userName);
  if (confirmRemove){
    DB.child("groups/"+groupUid+"/members/"+memberUid).remove();
    DB.child("users/"+memberUid+"/membership/"+groupUid).remove();
    showAdminPanel(groupUid);
  }

}
