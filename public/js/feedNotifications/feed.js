//------subsManager: Feed-------//

subsManager.setFeed = function(isOwnerCall) {
    if(isOwnerCall == undefined)
        isOwnerCall= false;

    if(activeEntity.entity == 'main')
        return;

    var userFeed = DB.child("users/"+userUuid+"/updates/"+activeEntity.entity+"/"+activeEntity.uid+"/feed");

    switch (activeEntity.entity) {
        case "chats":

            // re-defining userFeed in chats context
            DB.child("chats/"+activeEntity.uid+"/entity").once('value', function(datasnapshot){
                userFeed = DB.child("users/"+userUuid+"/updates/"+datasnapshot.val().typeInDB+"/"+activeEntity.uid+"/feed");
                
                userFeed.once("value", function(dataSnapshot) {

                    if (dataSnapshot.child("chats").exists()) {
                        // remove and listener inbox only if not registered to anything else
                        if (!subsManager.notificationsIsSet) {
                            // !!!!!!! NEVER EVER SHOULD THE NEXT LINES SWITCH THEIR ORDER !!!!!!!
                            //===================================================//

                                DB.child("chats/"+activeEntity.uid+"/messages").orderByChild("dateAdded").limitToLast(1).off("value", chats_cb);
                                userFeed.child("chats").remove();
                            //===================================================//

                            // first line shuts down a specific node listener, even if the listener used also for feed
                            // seconed line lunches line 12 in logic.js and re-establishes the listener, causing feed to be re-functional once again
                            // same applies to the opposite.
                            DB.child("users/"+userUuid+"/chatInboxes/"+activeEntity.uid).remove();
                        } else {
                            userFeed.child("chats").remove();
                        }

                        $("#feedSub").css("color", inactiveColor);

                    } else {
                        userFeed.child("chats").set(true);

                        // initialize only if not registered to anything else (use existing inbox)
                        if(!subsManager.notificationsIsSet)
                            DB.child("users/"+userUuid+"/chatInboxes/"+activeEntity.uid).set(0);
                        $("#feedSub").css("color", activeColor);
                    }
                });
            });
            break;

        case "groups":

            // get in only if on a group entity and function is called from the ownerCall box
            if (isOwnerCall) {
                userFeed.once("value", function(dataSnapshot) {
                    if (dataSnapshot.child("OwnerCalls").exists()) {

                        // !!!!!!! NEVER EVER SHOULD THE NEXT LINES SWITCH THEIR ORDER !!!!!!!
                        //===================================================//
                            DB.child(activeEntity.entity + "/" + activeEntity.uid + "/OwnerCalls").off('child_added');
                            userFeed.child("OwnerCalls").remove();
                        //===================================================//

                        // first line shuts down a specific node listener, even if the listener used also for feed
                        // seconed line lunches line 12 in logic.js and re-establishes the listener, causing feed to be re-functional once again
                        // same applies to the opposite.

                        // $("#feedSub").css("color", inactiveColor);
                        // NEEDED: ownerCall box, and an on/off button

                    } else {
                        userFeed.child("OwnerCalls").set(true);
                        // $("#feedSub").css("color", activeColor);
                        // NEEDED: ownerCall box, and an on/off button
                    }
                });

                // no need to keep on checking if were inside a group.
                break;
            }

        // if not an owner call inside a group, keep the fall..
        // please DO NOT put a break; statement here..

        default:

            userFeed.once("value", function(dataSnapshot) {
                if (dataSnapshot.child("newSubEntity").exists()) {

                    // !!!!!!! NEVER EVER SHOULD THE NEXT LINES SWITCH THEIR ORDER !!!!!!!
                    //===================================================//
                        DB.child(activeEntity.entity + "/" + activeEntity.uid + "/" + subEntity[activeEntity.entity]).off('child_added');
                        userFeed.child("newSubEntity").remove();
                    //===================================================//

                    // first line shuts down a specific node listener, even if the listener used also for feed
                    // seconed line lunches line 12 in logic.js and re-establishes the listener, causing feed to be re-functional once again
                    // same applies to the opposite.
                    
                    $("#feedSub").css("color", inactiveColor);

                } else {
                    userFeed.child("newSubEntity").set(true);
                    $("#feedSub").css("color", activeColor);
                }
            });

    }
};

subsManager.isFeedSet = function (isOwnerCall) {
    
    if(isOwnerCall == undefined)
        isOwnerCall= false;

    // if active entity is Main
    if(activeEntity.entity == 'main') {
        $("#feedSub").css("color", inactiveColor);
        return;
    }
    
    
    var userFeed = DB.child("users/"+userUuid+"/updates/"+activeEntity.entity+"/"+activeEntity.uid+"/feed");

    switch (activeEntity.entity) {
        case "chats":
            // re-defining userFeed in chats context
            DB.child("chats/"+activeEntity.uid+"/entity").once('value', function(datasnapshot) {
                userFeed = DB.child("users/"+userUuid+"/updates/"+datasnapshot.val().typeInDB+"/"+activeEntity.uid+"/feed");
                
                userFeed.once('value', function(dataSnapshot) {
    
                    subsManager.feedUpdatesSet = dataSnapshot.child("chats").exists();
                });
            });
            break;

        case "groups":
            // get in only if on a group entity and function is called from the ownerCall box
            if (isOwnerCall) {
                userFeed.once('value', function(dataSnapshot) {

                    subsManager.feedUpdatesSet = dataSnapshot.child("OwnerCalls").exists();
                });
                // no need to keep on checking if were inside a group.
                break;
            }

        // if not an owner call inside a group, keep the fall..
        // please DO NOT put a break; statement here..

        default:
            userFeed.once('value', function(dataSnapshot) {

                subsManager.feedUpdatesSet = dataSnapshot.child("newSubEntity").exists();
            });
    }

    if (subsManager.feedUpdatesSet) {
        $("#feedSub").css("color", activeColor);

        // if(isOwnerCall)
        // // NEEDED: ownerCall box, and an on/off button
    } else {
        $("#feedSub").css("color", inactiveColor);
        console.log("inactive feed!");
        // if(isOwnerCall)
        // // NEEDED: ownerCall box, and an on/off button
    }

};

function showFeed(){

   //show header

   //show footer

   //show wrapper
   var preContext = new Array();
   for (i in feedQueue){
      console.log(feedQueue[i].title);
      var title = feedQueue[i].title;
      var description = feedQueue[i].description;
      var entityType = feedQueue[i].

      preContext.push({title:title, description: description})



   }

   var context = {"feeds": preContext};
   console.log(JSON.stringify(context));

   renderTemplate("#feeds-tmpl", context, "wrapper")
}
