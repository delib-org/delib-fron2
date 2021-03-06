var chats_cb;
var entityAdded_cb;
var ownerCall_cb;

function initFeedManagerProps () {

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

    Object.defineProperty(feedManager , 'lastFeedAccess', {
        get: function () {

            return DB.child('users/'+userUuid+'/lastFeedAccess').once('value',function (snapshot){
                return snapshot;
            });
        },
        set: function (date) {

            DB.child('users/'+userUuid+'/lastFeedAccess').set(date);
        }
    });
}

function updatesListener() {

    // turn off previous listener
    DB.child("users/"+userUuid+"/updates").off();
    
    function regFalsify(regObject) {
        if (!(regObject.feed || regObject.notifications))
            regObject = false;
        return regObject;
    }

    var flags ={};

    // listen to Updates
    DB.child("users/"+userUuid+"/updates").on('value', function (entitiesUpdates) {
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

                isOwnerCallReg = regFalsify(isOwnerCallReg);
                isNewSubEntityReg = regFalsify(isNewSubEntityReg);
                isChatReg = regFalsify(isChatReg);


                // if subscribed to ownerCalls
                if (isOwnerCallReg) {
                    if(!firstRun) {
                        DB.child(entityUpdates.key + "/" + entityUpdate.key + "/ownerCalls").orderByChild('dateAdded').limitToLast(1).on('child_added',ownerCall_cb = function (ownerCall) {

                            // ==== regulation chunk ==== //
                            // will make sure we will get the latest whatever..
                            if (mostUpdatedContent == null)
                                mostUpdatedContent = ownerCall;
                            else if (mostUpdatedContent.val().dateAdded < ownerCall.val().dateAdded - 400)
                                mostUpdatedContent = ownerCall;
                            else
                                return;
                            // ============================================================================

                            DB.child(entityUpdates.key + "/" + entityUpdate.key).once('value', function (actualContent) {
                                if(isOwnerCallReg.notifications)
                                    pushNotification(actualContent, "ownerCalls", ownerCall.val().callText);

                                if(isOwnerCallReg.feed && feedManager.lastEntranceOn)
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
                                if (mostUpdatedContent == null)
                                    mostUpdatedContent = entityAddedUid;
                                else if (mostUpdatedContent.val().dateAdded < entityAddedUid.val().dateAdded - 400)
                                    mostUpdatedContent = entityAddedUid;
                                else
                                    return;
                                // ============================================================================
    
                                if (isNewSubEntityReg.notifications)
                                    pushNotification(actualContent, subEntity[entityUpdates.key]);
    
                                if (isNewSubEntityReg.feed)
                                    feedBuilder(actualContent, entityUpdates.key, entityAddedUid);
    
                            }); //.catch(function (error) { console.log(error, "no entity path") })
                        });
                    } else {
                        // feed catch-up chunk
                        DB.child(entityUpdates.key + "/" + entityUpdate.key + "/subEntities").orderByChild('dateAdded').once('value',function (subEnities) {
                            feedManager.lastFeedAccess.then(function (lastFeedAccess) {
                                subEnities.forEach(function (entityAdded) {
                                    if(lastFeedAccess.val() == null)
                                        return;

                                    DB.child(entityAdded.val().entityType + "/" + entityAdded.key).once('value', function (actualContent) {

                                        if (mostUpdatedContent == null)
                                            mostUpdatedContent = entityAdded;
                                        else if (mostUpdatedContent.val().dateAdded < entityAdded.val().dateAdded - 400)
                                            mostUpdatedContent = entityAdded;


                                        if (isNewSubEntityReg.feed && lastFeedAccess.val() < entityAdded.val().dateAdded)
                                            feedBuilder(actualContent, entityUpdates.key, entityAdded, {on: true, lastRun: false});
                                        else {
                                            flags.subEntities = true;
                                        }
                                    });
                                });
                            });
                        });

                    }
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
                                        if (mostUpdatedContent == null)
                                            mostUpdatedContent = lastMessage;
                                        else if (mostUpdatedContent.val().dateAdded < lastMessage.val().dateAdded - 400)
                                            mostUpdatedContent = lastMessage;
                                        else
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
                                            if (isChatReg.feed)
                                                feedBuilder(chatEntityContent,"chats", messagesSentInc);
                                        }
                                    }
                                });
                            });
                        });
                    } else {
                        // feed catch-up chunk
                        DB.child("chats/" + entityUpdate.key + "/messages").orderByChild('dateAdded').once('value',function (messages) {
                            DB.child("users/" + userUuid + "/chatInboxes/" + entityUpdate.key).once('value', function (inboxVolume) {
                                feedManager.lastFeedAccess.then(function (lastFeedAccess) {
                                    DB.child("/groups/" + entityUpdate.key).once('value', function (chatEntityContent) {
                                        messages.forEach(function (messageAdded) {
                                            if(lastFeedAccess == null)
                                                return;

                                            if (mostUpdatedContent == null)
                                                mostUpdatedContent = messageAdded;
                                            else if (mostUpdatedContent.val().dateAdded < messageAdded.val().dateAdded - 400)
                                                mostUpdatedContent = messageAdded;

                                            if (isNewSubEntityReg.feed && lastFeedAccess.val() < messageAdded.val().dateAdded) {
                                                // create a temporary messagesSentInc to hold inboxMessages.val()
                                                var messagesSentInc;

                                                // now we need the inboxMessages to get the number of messages not seen
                                                messagesSentInc = inboxVolume.val();

                                                // obvious incrementation, is obvious..
                                                messagesSentInc++;

                                                //set incremented inbox volume
                                                DB.child("users/" + userUuid + "/chatInboxes/" + entityUpdate.key).set(messagesSentInc);


                                                if (messagesSentInc % 5 ===  0)
                                                    feedBuilder(chatEntityContent, "chats", messagesSentInc, {on: true, lastRun: false});
                                            } else {
                                                flags.chats = true;
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    }
                }
            });
        });

    });

    if(flags.chats && flags.subEntities)
        $.event.trigger('catchUpDone');

    $(document).on('catchUpDone', function () {
        if(firstRun) {
            console.log("true true");
            firstRun = false;
            feedBuilder(undefined, undefined, undefined, {on: true, lastRun: true});
        }
    });
}

function feedCatchUp (json) {
    console.log("offline feed pushed");
    feedManager.catchUpArray[feedManager.catchUpArrayIndex] = json;
    feedManager.catchUpArrayIndex++;

    console.log(Object.keys(feedManager.catchUpArray).length);
}

// feed builder
function feedBuilder (entityDatum, entityType, variation, catchUpMode) {

    // if(firstRun) {
    //     firstRun = false;
    //     // feedManager.queue = [];
    //     console.log("first Run");
    //     return;
    // }

    if(catchUpMode == undefined)
        catchUpMode = {on: false, lastRun: false};

    var feedContentJson;

    if(!(catchUpMode.on && catchUpMode.lastRun))
        switch (entityType) {
            case "chats":
                feedContentJson = {
                    entityType: entityDatum.val().title,
                    entityUid: entityDatum.key,
                    chatMessagesCounter: variation,
                    date: entityDatum.val().dateAdded
                };

                if(catchUpMode.on) {
                    feedCatchUp(feedContentJson);
                    $.event.trigger('catchUpDone');
                    return;
                }

                feedManager.queue = feedContentJson;
                break;

            case "ownerCalls":
                feedContentJson = {
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
                    title: entityDatum.val().title,
                    description: entityDatum.val().description,
                    date: entityDatum.val().dateAdded,
                    entityType: variation.val().entityType,
                    entityUid: variation.key
                };

                if(catchUpMode.on) {
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

            console.log(feedManager.catchUpArray[3]);
            console.log(Object.keys(feedManager.catchUpArray).length);

            for( var key = 0 ; key <feedManager.catchUpArrayIndex; key++ ) {
                console.dir(feedManager.catchUpArray[key]);
                feedManager.queue = feedManager.catchUpArray[key];

                // if feedVolume got to 20, also remove last feed in feedQueue
                if(length >= feedManager.volume + 1)
                    feedManager.queue = "pop";
            }

            return;
        }

        // if feedVolume got to 20, also remove last feed in feedQueue
        if(length >= feedManager.volume + 1)
            feedManager.queue = "pop";

    }).then(function () {
        feedManager.inbox.then(function(val) {

            if(catchUpMode.on && catchUpMode.lastRun) {

                feedManager.inbox = val + feedManager.catchUpArrayIndex;
                return;
            }

            feedManager.inbox = ++val;

            console.log(val);
        }).then( function () {
            // triggering feedPushed event
            $.event.trigger('feedPushed');
        });
    });
}
