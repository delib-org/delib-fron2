function showAdminPanel(groupUid){
  renderTemplate("#adminControl-tmpl",{uid:groupUid},"wrapper");

  DB.child("groups/"+groupUid+"/pendings").once("value", function(pendings){

    console.log(pendings.val());
    var preCotext = [];
    pending.forEach(function(pending){
      preCotext.push({pending})
    })
  })

}

