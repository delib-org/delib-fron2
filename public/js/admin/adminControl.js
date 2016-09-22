function showAdminPanel(groupUid){
  renderTemplate("#adminControl-tmpl",{},"wrapper");

  DB.child("groups/"+groupUid+"/pendings").once("value", function(pendings){

    var preContext = [];
    if(pendings.val() !== null){
      pendings.forEach(function(pending){

        var dateAskedFor = parseDate(pending.val().dateAdded,"DDMMYY");

        preContext.push({name: pending.val().name, email: pending.val().email, date: dateAskedFor})
      });
      var context = {pendings: preContext}
      console.log(JSON.stringify(context));
      renderTemplate("#adminControlPending-tmpl",context, "#pendingMembersTable")
    } else {console.log("No pending members")}
  })

  DB.child("groups/"+groupUid+"/members").once("value", function(members){

    var preContext = [];
    if(members.val() !== null){
      members.forEach(function(member){

        var dateAskedFor = parseDate(member.val().dateAdded,"DDMMYY");

        preContext.push({name: member.val().name, email: member.val().email, date: dateAskedFor})
      });
      var context = {members: preContext}
      console.log(JSON.stringify(context))

      renderTemplate("#adminControlMembers-tmpl",context, "#CurrentMembersTable")
    } else {console.log("No members in group")}
  })

}

