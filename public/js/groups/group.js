function showGroup(groupUid){

  //show footer&header

  DB.child("groups/"+groupUid).once("value", function(dataSnapshot){
    //show header
    var title = dataSnapshot.val().title;
    var groupType = dataSnapshot.val().type;
    renderTemplate("#groupHeaderTitle-tmpl", {group: title, groupUid:groupUid}, "#headerTitle");
    renderTemplate("#headerMenu-tmpl",{type:"groups", uid:groupUid},"#headerMenu");
    showBreadCrumb("groups", groupUid, title);

    //show footer
    renderTemplate("#showEntityPanel-tmpl", {}, "footer");
    $("wrapper").css("overflow","auto");

    var showGroupCallback = function(subEntities){

      if(subEntities.exists()){

        var subEntitiesUnderGroup = subEntities.val();
        var numberOfSubEntities = Object.keys(subEntitiesUnderGroup).length;

        var subEntitiesUnderGroupArray = new Array();

        var i = 1;

        subEntities.forEach(function(subEntity){

          var pathToSubEntity = subEntity.val().entityType+"/"+subEntity.key;

          DB.child(pathToSubEntity).once("value", function(data){

            var preContext = new Object();

            if (data.exists()){

              var title = data.val().title;
              var description = data.val().description;

              preContext = {
                uuid: subEntity.key,
                entityType: subEntity.val().entityType,
                title: title,
                description: description,
                symbol: symbols[subEntity.val().entityType]
              }

              subEntitiesUnderGroupArray.push(preContext);
            }

            if (i === numberOfSubEntities){

              var context = {subEntities: subEntitiesUnderGroupArray};
              renderTemplate("#groupPage-tmpl", context, "wrapper");
              $("wrapper").hide();
              $("wrapper").fadeIn();
            }

            i++;
          })
        })
      } else {
        renderTemplate("#groupPage-tmpl",{}, "wrapper");
      }
    };


    //showing wrapper
    //check group type
    if (groupType == "public" || groupType == "close"){

      //show sub entities
      DB.child("groups/"+groupUid+"/subEntities").on("value", showGroupCallback);
    } else {
      //in case of secret group, check to see if user is a member
      var isMember = dataSnapshot.val().members[userUuid];
      DB.child("groups/"+groupUid+"/owner").once("value",function(ownership){
        if (userUuid == ownership.val() || isMember != null){
          //show sub entities
          DB.child("groups/"+groupUid+"/subEntities").on("value", showGroupCallback);
        } else {
          //dont show...
          $("wrapper").html("<h2>To see this group, you have to be a member</h2><p>To join, use the membership request button</p><button onclick='setMembership()'>Join Request</button>")
        }
      })

    }

    var turnOff = function () {
      DB.child("groups/"+groupUid+"/subEntities").off("value", showGroupCallback);
    };

    setActiveEntity("groups", groupUid, "value", showGroupCallback, turnOff);

    isMembership();
  }).then(function(rendered) {
    subsManager.isUpdatesSet();
  });





  if(!back){
    setUrl("group", groupUid);
  }


}


//show group topics
//function showGroupTopics(groupUid){
//   //get group topics
//
//   DB.child("groups/"+ groupUid.toString()+"/topics").on("value",
//}
