function updatesListener() {

    function regFalsify(regObject) {
        if (!(regObject.feed || regObject.notifications))
            regObject = false;
        return regObject;
    }

    // turn off previous listener
    DB.child("users/"+userUuid+"/updates").off();

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
                    feed: entityUpdate.child('feed/chat').exists(),
                    notifications: entityUpdate.child('notifications/chat').exists()
                };

                isOwnerCallReg = regFalsify(isOwnerCallReg);
                isNewSubEntityReg = regFalsify(isNewSubEntityReg);
                isChatReg = regFalsify(isChatReg);


                // if subscribed to ownerCalls
                if (isOwnerCallReg) {
                    DB.child(entityUpdates.key + "/" + entityUpdate.key + "/ownerCalls").orderByChild('dateAdded').limitToLast(1).on('child_added', function (ownerCall) {

                        // ==== regulation chunk ==== //
                        // will make sure we will get the latest whatever..
                        if (mostUpdatedContent == null) {
                            mostUpdatedContent = ownerCall;
                            console.log("mostUpdatedContent: " + mostUpdatedContent.val().dateAdded);
                        }
                        else if (mostUpdatedContent.val().dateAdded < ownerCall.val().dateAdded - 400)
                        {
                            mostUpdatedContent = ownerCall;
                            console.log("mostUpdatedContent: " + mostUpdatedContent.val().dateAdded);
                        }
                        else
                            return;
                        // ===============

                            DB.child(entityUpdates.key + "/" + entityUpdate.key).once('value', function (actualContent) {
                                if(isOwnerCallReg.notifications)
                                    pushNotification(actualContent, "ownerCalls", ownerCall.val().callText);

                                if(isOwnerCallReg.feed)
                                    feedBuilder(actualContent, "ownerCalls", ownerCall.val().callText);
                            });
                    });
                }

                // check if sub-entity added, only if registered to Global or Feed. if not registered fo both - move on

                if (isNewSubEntityReg) {
                    DB.child(entityUpdates.key + "/" + entityUpdate.key + "/" + subEntity[entityUpdates.key]).orderByChild('dateAdded').limitToLast(1).on('child_added', function (entityAddedUid) {
                        DB.child(subEntity[entityUpdates.key] + "/" + entityAddedUid.key).once('value', function (actualContent) {
                            // debugger;

                            console.log("actualContent: " + entityAddedUid.val().dateAdded);

                            // ==== regulation chunk ==== //
                            // will make sure we will get the latest whatever..
                            if (mostUpdatedContent == null) {
                                mostUpdatedContent = entityAddedUid;
                                console.log("mostUpdatedContent: " + mostUpdatedContent.val().dateAdded);
                            }
                            else if (mostUpdatedContent.val().dateAdded < entityAddedUid.val().dateAdded - 400)
                            {
                                mostUpdatedContent = entityAddedUid;
                                console.log("mostUpdatedContent: " + mostUpdatedContent.val().dateAdded);
                            }
                            else
                                return;
                            // ===============

                            if (isNewSubEntityReg.notifications)
                                // if(!(activeEntity.entity == entityUpdates.key && activeEntity.uid == entityUpdate.key))
                                    pushNotification(actualContent, subEntity[entityUpdates.key]);

                            if (isNewSubEntityReg.feed)
                                feedBuilder(actualContent, entityUpdates.key);

                        }); //.catch(function (error) { console.log(error, "no entity path") })
                    });
                }

                // chat logic

                if(isChatReg) {
                    // check if added message, get last message by date
                    DB.child("chats/" + entityUpdate.key + "/messages").orderByChild('dateAdded').limitToLast(1).on('child_added', function (lastMessage) {
                        // get inbox unseen messages counter
                        DB.child("users/" + userUuid + "/chatInboxes/" + entityUpdate.key).once('value', function (inboxVolume) {
                            // now we need the actual content of the entity related to current chatRoom
                            DB.child("/groups/" + entityUpdate.key).once('value', function (chatEntityContent) {
                                // don't bring up notificaions and nor count them if already inside subscribed chat room
                                if(!(activeEntity.entity == "chats" && activeEntity.uid == entityUpdate.key)) {
                                    // if no such group, get out

                                    if (chatEntityContent == null)
                                        return;

                                    // ==== regulation chunk ==== //
                                    // will make sure we will get the latest whatever..
                                    if (mostUpdatedContent == null) {
                                        mostUpdatedContent = lastMessage;
                                        console.log("mostUpdatedContent: " + mostUpdatedContent.val().dateAdded);
                                    }
                                    else if (mostUpdatedContent.val().dateAdded < lastMessage.val().dateAdded - 400)
                                    {
                                        mostUpdatedContent = lastMessage;
                                        console.log("mostUpdatedContent: " + mostUpdatedContent.val().dateAdded);
                                    }
                                    else
                                        return;
                                    // ===============

                                    // create a temporary messagesSentInc to hold inboxMessages.val()
                                    var messagesSentInc;

                                    // now we need the inboxMessages to get the number of messages not seen
                                    messagesSentInc = inboxVolume.val();

                                    // increment inbox volume
                                    if (firstRun) {
                                        firstRun = false;
                                        return;
                                    }

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
                }
            });
        });
    });
}



// feed builder
function feedBuilder (entityDatum, entityType, variation) {

    switch (entityType) {
        case "chats":
            feedQueue.push( {
                    roomName: entityDatum.val().title,
                    chatMessagesCounter: variation,
                    date: entityDatum.val().dateAdded
            });

            break;

        case "ownerCalls":
            feedQueue.push( {
                roomName: entityDatum.val().title,
                callText: variation,
                date: entityDatum.val().dateAdded
            });

            break;

        default:
            feedQueue.push({
                title: entityDatum.val().title,
                description: entityDatum.val().description,
                date: entityDatum.val().dateAdded
            });

            // if feedVolume got to 20, also remove last feed in feedQueue
            if(Object.keys(feedQueue).length >= feedVolume + 1)
                feedQueue.pop();

            break;
    }


    console.dir(feedQueue);
}


