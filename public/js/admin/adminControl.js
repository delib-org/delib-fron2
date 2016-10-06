var pendingTableCallback;
var membersTableCallback;
var promise1;
var promise2;

function showAdminPanel(groupUid){
  renderTemplate("#adminControl-tmpl",{},"#editGroupPages");

  //Pending Table
  DB.child("groups/"+groupUid+"/pendings").on("value", pendingTableCallback = function(pendings){

    var preContext = [];
    if(pendings.val() !== null){
      pendings.forEach(function(pending){

        var dateAskedFor = parseDate(pending.val().dateAdded,"DDMMYY");

        preContext.push({name: pending.val().name, email: pending.val().email, date: dateAskedFor, uid:pending.key, groupUid:groupUid})
      });
      var context = {pendings: preContext};

      renderTemplate("#adminControlPending-tmpl",context, "#pendingMembersTable")
    } else {
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
        var role = member.val().role || "member";

        switch(role){
          case "member":
            var selectMember = "selected";
            var selectManager = null;
            break;
          case "manager":
            var selectMember = null;
            var selectManager = "selected";
            break;
          default:
            var selectMember = "selected";
            var selectManager = null;

        }

        preContext.push({name: member.val().name, email: member.val().email, date: dateAskedFor, groupUid:groupUid, memberUid: member.key, selectMember:selectMember, selectManager:selectManager })
      });
      var context = {members: preContext}

      renderTemplate("#adminControlMembers-tmpl",context, "#CurrentMembersTable")
    } else {

      $("#CurrentMembersTable").text("There arn't any members in the group")
    }

    promise2 = Promise.resolve(true);

  });

  Promise.all([promise1, promise2]).then(function() {
    var turnOff = function () {
      DB.child("groups/"+groupUid+"/pendings").off("value", pendingTableCallback);
      DB.child("groups/"+groupUid+"/members").off("value", membersTableCallback);
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

function findMemberUid(name){
  DB.child("users").orderByChild("name").startAt(name).once("value", function(data){
    data.forEach(function(datum){adminControlMembers
      console.log(datum.val().name, datum.key)
    })

  })
}

function setMemberRole(seleted, memberUid, groupUid){
  console.log(seleted.value, memberUid, groupUid);
  DB.child("groups/"+groupUid+"/members/"+memberUid).update({role: seleted.value});
}
