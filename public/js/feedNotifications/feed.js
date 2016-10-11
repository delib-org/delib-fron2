//------subsManager: Feed-------//

subsManager.setFeed = function(isOwnerCall) {
    if(isOwnerCall == undefined)
        isOwnerCall= false;

    if(activeEntity.entityType == 'main')
        return;

    var userFeed = DB.child("users/" + userUuid + "/updates/" + activeEntity.entityType + "/" + activeEntity.uid + "/feed");

    switch (activeEntity.entityType) {
        case "adminControl":

            userFeed.once("value", function(dataSnapshot) {
                if (dataSnapshot.child("adminControl").exists()) {

                    // !!!!!!! NEVER EVER SHOULD THE NEXT LINES SWITCH THEIR ORDER !!!!!!!
                    //===================================================//
                    DB.child("groups/" + activeEntity.uid + "/pendings").orderByChild('dateAdded').limitToLast(1).off('child_added', pendingAdded_cb);
                    userFeed.child("adminControl").remove();
                    //===================================================//

                    // first line shuts down a specific node listener, even if the listener used also for feed
                    // seconed line lunches line 12 in logic.js and re-establishes the listener, causing feed to be re-functional once again
                    // same applies to the opposite.

                    $("#feedSub").css("color", inactiveColor);

                } else {
                    userFeed.child("adminControl").set(true);
                    $("#feedSub").css("color", activeColor);
                }
            });
            break;
        
        case "chats":

            // re-defining userFeed in chats context
            DB.child("chats/" + activeEntity.uid + "/entity").once('value', function(datasnapshot) {
                userFeed = DB.child("users/" + userUuid + "/updates/" + datasnapshot.val().typeInDB + "/" + activeEntity.uid + "/feed");
                
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
                            DB.child(activeEntity.entityType + "/" + activeEntity.uid + "/OwnerCalls").off('child_added', ownerCall_cb);
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
                        DB.child(activeEntity.entityType + "/" + activeEntity.uid + "/subEntities").orderByChild('dateAdded').limitToLast(1).off('child_added', entityAdded_cb);
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


    subsManager.isUpdatesSet();
};

subsManager.isFeedSet = function (isOwnerCall) {
    
    if(isOwnerCall == undefined)
        isOwnerCall= false;

    // if active entity is Main
    if(activeEntity.entityType == 'main') {
        $("#feedSub").css("color", inactiveColor);
        return;
    }
    
    
    var userFeed = DB.child("users/"+userUuid+"/updates/"+activeEntity.entityType+"/"+activeEntity.uid+"/feed");

    switch (activeEntity.entityType) {
        case "chats":
            // re-defining userFeed in chats context
            DB.child("chats/"+activeEntity.uid+"/entity").once('value', function(datasnapshot) {
                userFeed = DB.child("users/"+userUuid+"/updates/"+datasnapshot.val().typeInDB+"/"+activeEntity.uid+"/feed");
                
                userFeed.once('value', function(dataSnapshot) {
    
                    subsManager.feedUpdatesSet = dataSnapshot.child("chats").exists();
                });
            });
            break;

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

        // if(isOwnerCall)
        // // NEEDED: ownerCall box, and an on/off button
    }

};


