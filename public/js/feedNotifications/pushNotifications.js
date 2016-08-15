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

function pushNotification(EntityData, entityType, messagesSent) {

    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chrome.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission(EntityData);
    else {
        var notification;
        console.log(EntityData.val(), entityType );
        if (entityType == "chats") {
            notification = new Notification(EntityData.val().title, {
                icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                body: messagesSent + " הודעות חדשות"
            });
        } else if(entityType == "ownerCalls") {
            notification = new Notification("קריאת מנהל מ"+EntityData.val().title, {
                icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                body: messagesSent
            });
        } else {
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
    if(isOwnerCall == undefined)
        isOwnerCall= false;

    if(activeEntity.entity == undefined || activeEntity.uid == undefined)
        return;

    var userNotifications = DB.child("users/"+userUuid+"/updates/"+activeEntity.entity+"/"+activeEntity.uid+"/notifications");


    switch (activeEntity.entity) {
        case "chats":
            userNotifications.once("value", function(dataSnapshot) {

                if (dataSnapshot.child("chats").exists()) {
                    userNotifications.child("chats").remove();
                    $("#notificationsSub").css("color", inactiveColor);
                    // firstRun = false;

                    // remove inbox only if not registered to anything else
                    if(!subsManager.feedIsSet)
                        DB.child("users/"+userUuid+"/chatInboxes/"+activeEntity.uid).remove();

                } else {
                    userNotifications.child("chats").set(true);
                    
                    // initialize only if not registered to anything else (use existing inbox)
                    if(!subsManager.feedIsSet)
                        DB.child("users/"+userUuid+"/chatInboxes/"+activeEntity.uid).set(0);
                    // firstRun = true;
                    $("#notificationsSub").css("color", activeColor);
                }
            });
            break;

        case "groups":

            // get in only if on a group entity and function is called from the ownerCall box
            if (isOwnerCall) {
                userNotifications.once("value", function(dataSnapshot) {
                    if (dataSnapshot.child("OwnerCalls").exists()) {
                        userNotifications.child("OwnerCalls").remove();
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
                    userNotifications.child("newSubEntity").remove();
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

    if(activeEntity.entity == 'undefined' || activeEntity.uid == 'undefined')
        return;

    var userNotifications = DB.child("users/"+userUuid+"/updates/"+activeEntity.entity+"/"+activeEntity.uid+"/notifications");

    switch (activeEntity.entity) {
        case "chats":
            userNotifications.once('value', function(dataSnapshot) {

                subsManager.notificationsIsSet = dataSnapshot.child("chats").exists();
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

        // if(isOwnerCall)
        // // NEEDED: ownerCall box, and an on/off button
    }
    
};
