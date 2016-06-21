function showAddTopicScreen(){
  convertTemplate("#createTopic-tmpl",{}, "wrapper");
  convertTemplate("#createTopicFooter-tmpl",{}, "footer")
}

function addNweTopic(){
  topicName = $("#createTopicName").val();
  topicDescription = $("#createTopicDescription").val();

  if (topicName == "") {
    alert("חסר שם נושא");
    return;
  }

  if (userUuid == "" || userUuid == undefined) {
    alert("אנא התחבר/י למערכת");
    return;
  }

  var newTopic = DB.child("topics").push({title: topicName, description: topicDescription, owner: userUuid });
  if (activeEntity.entity == "groups"){
    var group = activeEntity.uid;
    DB.child("groups/"+group+"/topics"+newTopic.key).set(true);
  }
  DB.child("users/"+userUuid+"/topics/"+newTopic.key).set("owner");
}