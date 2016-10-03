// Add feature check for Service Workers here
var SWreg;
var isSubscribed = false;
var subFcm;


// Request notifications permission on page load

document.addEventListener('DOMContentLoaded', function () {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
});


//------External FCM Notifications-------

function sefFcmPushNotiifications() {
  if (isSubscribed) {
    fcmUnsubscribe();
  } else {
    fcmSubscribe();
  }
}

function fcmSubscribe() {
  SWreg.pushManager.subscribe({userVisibleOnly: true}).
  then(function(pushSubscription) {
    subFcm = pushSubscription;
    // console.log('Subscribed! Endpoint:', subFcm.endpoint);
    $('#fcmPushNotiificationsBtn').prop('value', 'Unsubscribe');
    isSubscribed = true;
  });
}

function fcmUnsubscribe() {
  subFcm.unsubscribe().then(function(event) {
    $('#fcmPushNotiificationsBtn').prop('value', 'Subscribe');
    // console.log('Unsubscribed!', event);
    isSubscribed = false;
  }).catch(function(error) {
    // console.log('Error unsubscribing', error);
    $('#fcmPushNotiificationsBtn').prop('value', 'Subscribe');
  });
}

function pushNotification(EntityData, entityType, variation) {

    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chrome.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission(EntityData);
    else {
        var notification;
        switch (entityType) {
            case "chats":
                notification = new Notification(EntityData.val().title, {
                    icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                    body: variation + " הודעות חדשות"
                });
                break;
            case "ownerCalls":
                notification = new Notification("קריאת מנהל מ" + EntityData.val().title, {
                    icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                    body: variation
                });
                break;
            case "adminControl":
                notification = new Notification("הצעת חברות ממשתמש: " + EntityData.val().title, {
                    icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                    body: variation
                });
                break;

            default:
                notification = new Notification(EntityData.val().title, {
                    icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                    body: EntityData.val().description
                });
        }

        notification.onclick = function () {
            switch (entityType){
                case "groups": showGroup(EntityData.key); break;
                case "topics": showTopic(EntityData.key); break;
                case "questions": showQuestion(EntityData.key); break;
                case "chats": showChat(EntityData.key); break; //look for change in showChat function... lets talk about it (Tal);
                case "ownerCalls": showGroup(EntityData.key);
                // for a later use
                // case "options": showOptionInfo(EntityData.key); break;
            }
        };
    }
}

//------subsManager: Notifications-------//


subsManager.setNotifications = function(isOwnerCall) {
    if (isOwnerCall == undefined)
        isOwnerCall= false;

    if (activeEntity.entityType == 'main')
        return;

    var userNotifications = DB.child("users/"+userUuid+"/updates/"+activeEntity.entityType+"/"+activeEntity.uid+"/notifications");

    switch (activeEntity.entityType) {
        case "chats":

            // re-defining userFeed in chats context
            DB.child("chats/"+activeEntity.uid+"/entity").once('value', function(datasnapshot) {
                userNotifications = DB.child("users/"+userUuid+"/updates/"+datasnapshot.val().typeInDB+"/"+activeEntity.uid+"/notifications");

                userNotifications.once("value", function(dataSnapshot) {

                    if (dataSnapshot.child("chats").exists()) {

                        $("#notificationsSub").css("color", inactiveColor);

                        // remove and listener inbox only if not registered to anything else
                        if (!subsManager.feedIsSet) {

                            // !!!!!!! NEVER EVER SHOULD THE NEXT LINES SWITCH THEIR ORDER !!!!!!!
                            //===================================================//

                            DB.child("chats/"+activeEntity.uid+"/messages").orderByChild("dateAdded").limitToLast(1).off("value", chats_cb);
                            userNotifications.child("chats").remove();
                            //===================================================//

                            // first line shuts down a specific node listener, even if the listener used also for feed
                            // seconed line lunches line 12 in logic.js and re-establishes the listener, causing feed to be re-functional once again
                            // same applies to the opposite.
                            DB.child("users/"+userUuid+"/chatInboxes/"+activeEntity.uid).remove();
                        } else {
                            userNotifications.child("chats").remove();
                        }


                    } else {
                        userNotifications.child("chats").set(true);

                        // initialize only if not registered to anything else (use existing inbox)
                        if (!subsManager.feedIsSet)
                            DB.child("users/"+userUuid+"/chatInboxes/"+activeEntity.uid).set(0);
                        // firstRun = true;
                        $("#notificationsSub").css("color", activeColor);
                    }
                })
            });
            break;

        case "groups":

            // get in only if on a group entity and function is called from the ownerCall box
            if (isOwnerCall) {
                userNotifications.once("value", function(dataSnapshot) {
                    if (dataSnapshot.child("OwnerCalls").exists()) {

                        // !!!!!!! NEVER EVER SHOULD THE NEXT LINES SWITCH THEIR ORDER !!!!!!!
                        //===================================================//
                            DB.child(activeEntity.entityType + "/" + activeEntity.uid + "/OwnerCalls").off('child_added');
                            userNotifications.child("OwnerCalls").remove();
                        //===================================================//

                        // first line shuts down a specific node listener, even if the listener used also for feed
                        // seconed line lunches line 12 in logic.js and re-establishes the listener, causing feed to be re-functional once again
                        // same applies to the opposite.
                        
                        // $("#notificationsSub").css("color", inactiveColor);
                        // NEEDED: ownerCall box, and an on/off button

                    } else {
                        userNotifications.child("OwnerCalls").set(true);
                        // $("#notificationsSub").css("color", activeColor);
                        // NEEDED: ownerCall box, and an on/off button
                    }
                });

                // no need to keep on checking if were inside a group.
                break;
            }

        // if not an owner call inside a group, keep the fall..
        // please DO NOT put a break; statement here..

        default:
            userNotifications.once("value", function(dataSnapshot) {
                if (dataSnapshot.child("newSubEntity").exists()) {

                    // !!!!!!! NEVER EVER SHOULD THE NEXT LINES SWITCH THEIR ORDER !!!!!!!
                    //===================================================//
                        DB.child(activeEntity.entityType + "/" + activeEntity.uid + "/" + subEntity[activeEntity.entityType]).off('child_added');
                        userNotifications.child("newSubEntity").remove();
                    //===================================================//

                    // first line shuts down a specific node listener, even if the listener used also for feed
                    // seconed line lunches line 12 in logic.js and re-establishes the listener, causing feed to be re-functional once again
                    // same applies to the opposite.

                    $("#notificationsSub").css("color", inactiveColor);

                } else {
                    userNotifications.child("newSubEntity").set(true);
                    $("#notificationsSub").css("color", activeColor);
                }
            });
    }
};

subsManager.isNotificationsSet = function (isOwnerCall) {

    if(isOwnerCall == undefined)
        isOwnerCall= false;

    if(activeEntity.entityType == 'main') {
        $("#notificationsSub").css("color", inactiveColor);
        return;
    }

    var userNotifications = DB.child("users/"+userUuid+"/updates/"+activeEntity.entityType+"/"+activeEntity.uid+"/notifications");

    switch (activeEntity.entityType) {
        case "chats":
            // re-defining userFeed in chats context
            DB.child("chats/"+activeEntity.uid+"/entity").once('value', function(datasnapshot) {
                userNotifications = DB.child("users/"+userUuid+"/updates/"+datasnapshot.val().typeInDB+"/"+activeEntity.uid+"/notifications");
                
                userNotifications.once('value', function(dataSnapshot) {
    
                    subsManager.notificationsIsSet = dataSnapshot.child("chats").exists();
                });
            });
            break;

        case "groups":
            // get in only if on a group entity and function is called from the ownerCall box
            if (isOwnerCall) {
                userNotifications.once('value', function(dataSnapshot) {

                    subsManager.notificationsIsSet = dataSnapshot.child("OwnerCalls").exists();
                });
                // no need to keep on checking if were inside a group.
                break;
            }

        // if not an owner call inside a group, keep the fall..
        // please DO NOT put a break; statement here..

        default:
            userNotifications.once('value', function(dataSnapshot) {

                subsManager.notificationsIsSet = dataSnapshot.child("newSubEntity").exists();
            });
    }

    if (subsManager.notificationsIsSet) {
        $("#notificationsSub").css("color", activeColor);

        // if(isOwnerCall)
        // // NEEDED: ownerCall box, and an on/off button
    } else {
        $("#notificationsSub").css("color", inactiveColor);
        console.log("inactive notifications!");
        // if(isOwnerCall)
        // // NEEDED: ownerCall box, and an on/off button
    }

};
