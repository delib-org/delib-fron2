function openTopicMenu(topicUid){

  if ($("#topicMenu"+topicUid).is(':visible')){
    $("#topicMenu"+topicUid).hide(400);
  } else {
    $("#topicMenu"+topicUid).show(400);
  }
}

function editTopic(topicUid){
  renderTemplate("#createTopic-tmpl",{},"wrapper");
  renderTemplate("#editTopicFooter-tmpl",{topicUid:topicUid}, "footer");

  DB.child("topics/"+topicUid).once("value", function(dataSnapshot){
    var title = dataSnapshot.val().title;
    var description = dataSnapshot.val().description;
    $("#createTopicName").val(title);
    $("#createTopicDescription").val(description);
  })
}

function sendTopicToDB(topicUid){
  var title = $("#createTopicName").val();
  var description = $("#createTopicDescription").val();

  DB.child("topics/"+topicUid).update({title: title,description:description });
  showEntities(activeEntity.entityType, activeEntity.uid);

}
