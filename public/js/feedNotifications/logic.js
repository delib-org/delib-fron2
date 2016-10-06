var chats_cb;
var entityAdded_cb;
var ownerCall_cb;
var pendingAdded_cb;

function initFeedManagerProps () {

    Object.defineProperty(updatesRegulator , 'latestContent', {
        get: function () {
            return DB.child('users/'+userUuid+'/latestContent').once('value', function (snapshot) {

                return snapshot.val();
            });
        }
    });

    updatesRegulator.latestContent.then(function (snapshot) {
        updatesRegulator.latestContentLocal = snapshot.val();
        // updatesRegulator.latestContentLocal = {
        //     dateAdded : 1473512293636
        // };
    });

    updatesRegulator.regulate = function (newLatestContent) {

        if(!newLatestContent)
            return null;


        if(updatesRegulator.latestContentLocal == null ) {
            DB.child('users/'+userUuid+'/latestContent').set(newLatestContent.val().dateAdded);
            updatesRegulator.latestContentLocal = newLatestContent.val();
            console.log(updatesRegulator.latestContentLocal, "latestContentLocal de-nulled");
            return false;
        } else if (updatesRegulator.latestContentLocal.dateAdded <= newLatestContent.val().dateAdded - 400) {
            // found a latest content, content should be pushed..
            DB.child('users/'+userUuid+'/latestContent').set(newLatestContent.val().dateAdded);
            updatesRegulator.latestContentLocal = newLatestContent.val();
            console.log("REGULATED!");
            return false;
        } else {
            console.log("no regulation needed");
            return true;
        }
    };


    feedManager.catchUpArray = {};
    feedManager.catchUpArrayIndex = 0;

    Object.defineProperty(feedManager , 'inbox', {
        get: function () {

            var val;
            return DB.child('users/'+userUuid+'/feedInbox').once('value',function (snapshot){
                val = snapshot.val();
            }).then(function (){
                return val;
            });
        },
        set: function (val) {
            DB.child('users/'+userUuid+'/feedInbox').set(val);
        }
    });

    Object.defineProperty(feedManager , 'queue', {
        get: function () {

            return DB.child('users/'+userUuid+'/feed').once('value',function (snapshot){
                return snapshot;
            });
        },
        set: function (json) {

            console.log(json);
            switch (json){
                case 'pop':

                    DB.child('users/'+userUuid+'/feed').orderByChild('date').limitToFirst(1).once('value',function (snapshot) {
                        DB.child('users/'+userUuid+'/feed/'+snapshot.key).remove();
                    });
                    break;

                case 'popAll':

                    DB.child('users/'+userUuid+'/feed').remove();
                    break;

                default:
                    DB.child('users/'+userUuid+'/feed').push(json);
            }
        }
    });

    Object.defineProperty(feedManager , 'lastEntranceOn', {
        get: function () {

            return DB.child('users/'+userUuid+'/lastEntranceOn').once('value',function (snapshot){
                return snapshot;
            });
        },
        set: function (date) {

            DB.child('users/'+userUuid+'/lastEntranceOn').set(date);
        }
    });
}

var catchUpPromises = new Array(3);

catchUpPromises.fill(false);


function updatesListener() {

    // turn off previous listener
    DB.child("users/"+userUuid+"/updates").off();
    
    function regFalsify(regObject) {
        if (!(regObject.feed || regObject.notifications))
            regObject = false;
        return regObject;
    }



    // listen to Updates
    DB.child("users/"+userUuid+"/updates").on('value', function (entitiesUpdates) {
        console.log("on");
        // search inside entities
        entitiesUpdates.forEach(function (entityUpdates) {
            // search inside entity
            entityUpdates.forEach(function (entityUpdate) {

                var isNewSubEntityReg = {
                    feed: entityUpdate.child('feed/newSubEntity').exists(),
                    notifications: entityUpdate.child('notifications/newSubEntity').exists()
                };

                var isOwnerCallReg = {
                    feed: entityUpdate.child('feed/ownerCalls').exists(),
                    notifications: entityUpdate.child('notifications/ownerCalls').exists()
                    };

                var isChatReg = {
                    feed: entityUpdate.child('feed/chats').exists(),
                    notifications: entityUpdate.child('notifications/chats').exists()
                };

                var isAdminControlReg = {
                    feed: entityUpdate.child('feed/adminControl').exists(),
                    notifications: entityUpdate.child('notifications/adminControl').exists()
                };

                isOwnerCallReg = regFalsify(isOwnerCallReg);
                isNewSubEntityReg = regFalsify(isNewSubEntityReg);
                isChatReg = regFalsify(isChatReg);
                isAdminControlReg = regFalsify(isAdminControlReg);

                if (isAdminControlReg) {
                    if(!firstRun) {
                        DB.child("/groups/" + entityUpdate.key + "/pendings").orderByChild('dateAdded').limitToLast(1).on('child_added', ownerCall_cb = function (NewPending) {

                            // ==== regulation chunk ==== //
                            // will make sure we will get the latest whatever..
                            if (updatesRegulator.regulate(NewPending))
                                return;
                                // ============================================================================

                            DB.child(entityUpdates.key + "/" + entityUpdate.key).once('value', function (actualContent) {
                                if(isAdminControlReg.notifications)
                                    pushNotification(actualContent, "adminControl", NewPending.val().callText);

                                if(isAdminControlReg.feed)
                                    feedBuilder(actualContent, "adminControl", NewPending.val().callText);
                            });

                        });
                    } else {
                        // feed catch-up chunk
                        DB.child("/groups/" + entityUpdate.key + "/pendings").orderByChild('dateAdded').once('value',function (pendings) {
                            feedManager.lastEntranceOn.then(function (lastEntranceOn) {
                                pendings.forEach(function (NewPending) {
                                    if(lastEntranceOn.val() == null)
                                        return;

                                    if (updatesRegulator.regulate(NewPending))
                                        return;

                                    DB.child(NewPending.val().entityType + "/" + NewPending.key).once('value', function (actualContent) {

                                        if (isNewSubEntityReg.feed && lastEntranceOn.val() < NewPending.val().dateAdded)
                                            feedBuilder(actualContent, entityUpdates.key, NewPending, {
                                                on: true,
                                                lastRun: false
                                            });
                                    });
                                });
                            })
                                .then(function () {
                                    console.log('resolved?');
                                    catchUpPromises[0] = true;
                                    if(catchUpPromises.every(Boolean))
                                        $.event.trigger('catchUpDone');
                                });
                        });
                    }
                } else if(firstRun) {
                    console.log('resolved?');
                    catchUpPromises[0] = true;
                    if(catchUpPromises.every(Boolean))
                        $.event.trigger('catchUpDone');
                }

                // if subscribed to ownerCalls
                if (isOwnerCallReg) {
                    if(!firstRun) {
                        DB.child(entityUpdates.key + "/" + entityUpdate.key + "/ownerCalls").orderByChild('dateAdded').limitToLast(1).on('child_added', ownerCall_cb = function (ownerCall) {

                            // ==== regulation chunk ==== //
                            // will make sure we will get the latest whatever..

                            if (updatesRegulator.regulate(ownerCall))
                                return;
                            // ============================================================================

                            DB.child(entityUpdates.key + "/" + entityUpdate.key).once('value', function (actualContent) {
                                if (isOwnerCallReg.notifications)
                                    pushNotification(actualContent, "ownerCalls", ownerCall.val().callText);

                                if (isOwnerCallReg.feed)
                                    feedBuilder(actualContent, "ownerCalls", ownerCall.val().callText);
                            });

                        });
                    } else {
                        // just copy-paste the correlative code from other chunks..
                    }
                }

                // check if sub-entity added, only if registered to Global or Feed. if not registered fo both - move on

                if (isNewSubEntityReg) {
                    if(!firstRun) {
                        DB.child(entityUpdates.key + "/" + entityUpdate.key + "/subEntities").orderByChild('dateAdded').limitToLast(1).on('child_added', entityAdded_cb = function (entityAddedUid) {
                            DB.child(entityAddedUid.val().entityType + "/" + entityAddedUid.key).once('value', function (actualContent) {

                                // ==== regulation chunk ==== //
                                // will make sure we will get the latest whatever..
                                if (updatesRegulator.regulate(entityAddedUid))
                                    return;

                               if (isNewSubEntityReg.notifications)
                                   pushNotification(actualContent, subEntity[entityUpdates.key]);

                               if (isNewSubEntityReg.feed)
                                   feedBuilder(actualContent, entityUpdates.key, entityAddedUid);
                                });
                                // ============================================================================
                        });
                    } else {
                        console.log("catch-up subEntities");
                        // feed catch-up chunk
                        DB.child(entityUpdates.key + "/" + entityUpdate.key + "/subEntities").orderByChild('dateAdded').once('value',function (subEnities) {
                            feedManager.lastEntranceOn.then(function (lastEntranceOn) {

                                console.log("inside! catch-up subEntities");
                                subEnities.forEach(function (entityAdded) {
                                    if(lastEntranceOn.val() == null)
                                        return;

                                    if (updatesRegulator.regulate(entityAdded))
                                        return;

                                    DB.child(entityAdded.val().entityType + "/" + entityAdded.key).once('value', function (actualContent) {
                                            if (isNewSubEntityReg.feed && lastEntranceOn.val() < entityAdded.val().dateAdded)
                                                feedBuilder(actualContent, entityUpdates.key, entityAdded, {
                                                    on: true,
                                                    lastRun: false
                                                });
                                    });
                                });
                            }).then(function () {
                                console.log("resolved?");
                                    catchUpPromises[1] = true;
                                    if(catchUpPromises.every(Boolean))
                                        $.event.trigger('catchUpDone');
                            });
                        });
                    }
                } else if(firstRun) {
                    catchUpPromises[1] = true;
                    if(catchUpPromises.every(Boolean))
                        $.event.trigger('catchUpDone');
                }

                // chat logic

                if(isChatReg) {
                    if(!firstRun) {
                        // check if added message, get last message by date
                        DB.child("chats/" + entityUpdate.key + "/messages").orderByChild('dateAdded').limitToLast(1).on('child_added', chats_cb = function (lastMessage) {
                            // get inbox unseen messages counter
                            DB.child("users/" + userUuid + "/chatInboxes/" + entityUpdate.key).once('value', function (inboxVolume) {
                                // now we need the actual content of the entity related to current chatRoom, note that chat updates bound to groups only..
                                DB.child("/groups/" + entityUpdate.key).once('value', function (chatEntityContent) {
                                    // don't bring up notificaions and nor count them if already inside subscribed chat room
                                    if(!(activeEntity.entityType == "chats" && activeEntity.uid == entityUpdate.key)) {

                                        // if no such group, get out
                                        if (chatEntityContent == null)
                                            return;
    
                                        // ==== regulation chunk ==== //
                                        // will make sure we will get the latest whatever..
                                        if (updatesRegulator.regulate(lastMessage))
                                            return;
                                        // ============================================================================

                                        // create a temporary messagesSentInc to hold inboxMessages.val()
                                        var messagesSentInc;

                                        // now we need the inboxMessages to get the number of messages not seen
                                        messagesSentInc = inboxVolume.val();

                                        // obvious incrementation, is obvious..
                                        messagesSentInc++;

                                        //set incremented inbox volume
                                        DB.child("users/" + userUuid + "/chatInboxes/" + entityUpdate.key).set(messagesSentInc);

                                        // send notifications in jumps of 5, might want to consider further manipulations. currently unused.
                                        if (messagesSentInc % 5 ===  0) {
                                            if (isChatReg.notifications)
                                                pushNotification(chatEntityContent, "chats", messagesSentInc);
                                            if (isChatReg.feed){
                                                var tempArr =[
                                                    messagesSentInc,
                                                    updatesRegulator.latestContentLocal.val()
                                                ];

                                                feedBuilder(chatEntityContent,"chats", tempArr);
                                            }
                                        }
                                    }
                                });
                            });
                        });
                    } else {
                        console.log("catch-up chats");
                        // feed catch-up chunk
                        DB.child("chats/" + entityUpdate.key + "/messages").orderByChild('dateAdded').once('value',function (messages) {
                            DB.child("users/" + userUuid + "/chatInboxes/" + entityUpdate.key).once('value', function (inboxVolume) {
                                DB.child("/groups/" + entityUpdate.key).once('value', function (chatEntityContent) {
                                    feedManager.lastEntranceOn.then(function (lastEntranceOn) {

                                        console.log("inside! catch-up chats");
                                        messages.forEach(function (messageAdded) {

                                            if(lastEntranceOn == null)
                                                return;

                                            if (updatesRegulator.regulate(messageAdded))
                                                return;

                                            if (isChatReg.feed && lastEntranceOn.val() < messageAdded.val().dateAdded) {
                                                // create a temporary messagesSentInc to hold inboxMessages.val()
                                                var messagesSentInc;

                                                // now we need the inboxMessages to get the number of messages not seen
                                                // messagesSentInc = inboxVolume.val();
                                                messagesSentInc = inboxVolume.val();

                                                // obvious incrementation, is obvious..
                                                messagesSentInc++;

                                                //set incremented inbox volume

                                                DB.child("users/" + userUuid + "/chatInboxes/" + entityUpdate.key).set(messagesSentInc);

                                                if (messagesSentInc % 5 === 0) {
                                                    var tempArr = [
                                                        messagesSentInc,
                                                        updatesRegulator.latestContentLocal
                                                    ];

                                                    feedBuilder(chatEntityContent, "chats", tempArr, {
                                                        on: true,
                                                        lastRun: false
                                                    });
                                                }
                                            }
                                        });
                                    }).then(function () {
                                        console.log("resolved?");
                                        catchUpPromises[2] = true;
                                        if(catchUpPromises.every(Boolean))
                                            $.event.trigger('catchUpDone');
                                });
                                });
                            });
                        });
                    }
                } else if(firstRun) {
                    catchUpPromises[2] = true;
                    if(catchUpPromises.every(Boolean))
                        $.event.trigger('catchUpDone');
                }
            });
        });
    });
}

$(document).on('catchUpDone', function () {
    if(firstRun) {
        console.log("catch-up is DONE");
        firstRun = false;
        feedBuilder(undefined, undefined, undefined, {on: true, lastRun: true});
        updatesListener();
        feedManager.lastEntranceOn = firebase.database.ServerValue.TIMESTAMP;
    }
});

function feedCatchUp (json) {
    console.log("offline feed pushed");
    feedManager.catchUpArray[feedManager.catchUpArrayIndex] = json;
    feedManager.catchUpArrayIndex++;
}

// feed builder
function feedBuilder (entityDatum, entityType, variation, catchUpMode) {

    if(catchUpMode == undefined)
        catchUpMode = {on: false, lastRun: false};

    var feedContentJson;

    if(!(catchUpMode.on && catchUpMode.lastRun))
        switch (entityType) {
            case "chats":
                feedContentJson = {
                    feedType: "chats",
                    entityType: entityDatum.val().title,
                    entityUid: entityDatum.key,
                    chatMessagesCounter: variation[0],
                    description: variation[1],
                    date: entityDatum.val().dateAdded
                };

                if(catchUpMode.on) {
                    console.log('catchup chats');
                    feedCatchUp(feedContentJson);
                    return;
                }

                feedManager.queue = feedContentJson;
                break;

            case "adminControl":
                feedContentJson = {
                    feedType: "adminControl",
                    entityType: entityDatum.val().title,
                    entityUid: entityDatum.key,
                    chatMessagesCounter: variation[0],
                    laseMessageContent: variation[1],
                    date: entityDatum.val().dateAdded
                };

                if(catchUpMode.on) {
                    console.log('catchup adminControl');
                    feedCatchUp(feedContentJson);
                    return;
                }

                feedManager.queue = feedContentJson;
                break;

            case "ownerCalls":
                feedContentJson = {
                    feedType: "ownerCalls",
                    roomName: entityDatum.val().title,
                    callText: variation,
                    date: entityDatum.val().dateAdded
                };

                if(catchUpMode.on) {
                    feedCatchUp(feedContentJson);
                    return;
                }

                feedManager.queue = feedContentJson;
                break;

            default:

                feedContentJson = {
                    feedType: "newSubEntity",
                    title: entityDatum.val().title,
                    description: entityDatum.val().description,
                    date: entityDatum.val().dateAdded,
                    entityType: variation.val().entityType,
                    entityUid: variation.key
                };

                if(catchUpMode.on) {
                    console.log('catchup newSubEntity');
                    feedCatchUp(feedContentJson);
                    return;
                }

                feedManager.queue = feedContentJson;
                break;
        }

    feedManager.queue.then(function (snapshot) {

        var length;

        if (snapshot.val() !== null)
            length = Object.keys(snapshot.val()).length;
                else
            length = 0;

        if(catchUpMode.on && catchUpMode.lastRun) {

            console.log("catch-up array sizez: ", Object.keys(feedManager.catchUpArray).length, feedManager.catchUpArrayIndex);

            $.each(feedManager.catchUpArray, function (index,item ) {
                console.dir(item);
                feedManager.queue = item;

                // if feedVolume got to 20, also remove last feed in feedQueue
                if( index > feedManager.volume ) {
                    feedManager.queue = "pop";
                }
            });

            return;
        }

        // if feedVolume got to 20, also remove last feed in feedQueue
        if(length >= feedManager.volume + 1)
            feedManager.queue = "pop";

    }).then(function () {
        feedManager.inbox.then(function(val) {

            if(catchUpMode.on && catchUpMode.lastRun) {
                if(val + feedManager.catchUpArrayIndex >= feedManager.volume)
                    feedManager.inbox = feedManager.volume;
                else
                    feedManager.inbox = val + feedManager.catchUpArrayIndex;

                return;
            }

            feedManager.inbox = ++val;

        }).then( function () {
            // triggering feedPushed event
            $.event.trigger('feedPushed');
        });
    });
}
