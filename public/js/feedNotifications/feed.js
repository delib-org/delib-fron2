//------subsManager: Feed-------//

subsManager.setFeed = function(isOwnerCall) {

    if(isOwnerCall == undefined)
        isOwnerCall= false;
    
    if(activeEntity.entity == 'undefined' || activeEntity.uid == 'undefined')
        return;

    var userFeed = DB.child("users/"+userUuid+"/updates/"+activeEntity.entity+"/"+activeEntity.uid+"/feed");

    switch (activeEntity.entity) {
        case "chats":
            userFeed.once("value", function(dataSnapshot) {

                if (dataSnapshot.child("chats").exists()) {
                    userFeed.child("chats").remove();
                    $("#feedSub").css("color", inactiveColor);

                    // remove inbox only if not registered to anything else
                    if(!subsManager.notificationsIsSet)
                        DB.child("users/"+userUuid+"/chatInboxes/"+activeEntity.uid).remove();

                } else {
                    userFeed.child("chats").set(true);

                    // initialize only if not registered to anything else (use existing inbox)
                    if(!subsManager.notificationsIsSet)
                        DB.child("users/"+userUuid+"/chatInboxes/"+activeEntity.uid).set(0);
                    $("#feedSub").css("color", activeColor);
                }
            });
            break;

        case "groups":

            // get in only if on a group entity and function is called from the ownerCall box
            if (isOwnerCall ) {
                userFeed.once("value", function(dataSnapshot) {
                    if (dataSnapshot.child("OwnerCalls").exists()) {
                        userFeed.child("OwnerCalls").remove();
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
                    userFeed.child("newSubEntity").remove();
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
    
    if(activeEntity.entity == 'undefined' || activeEntity.uid == 'undefined')
        return;

    var userFeed = DB.child("users/"+userUuid+"/updates/"+activeEntity.entity+"/"+activeEntity.uid+"/feed");

    switch (activeEntity.entity) {
        case "chats":
            userFeed.once('value', function(dataSnapshot) {

                subsManager.feedUpdatesSet = dataSnapshot.child("chats").exists();
            });
            break;

        case "groups":
            // get in only if on a group entity and function is called from the ownerCall box
            if (isOwnerCall ) {
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
