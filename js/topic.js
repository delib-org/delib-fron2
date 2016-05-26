//create new topic
function createNewTopic(title, description, explanation, imgTopic){

  if (title == undefined){
    title = "";
    console.log("Error: new topic do not have title");
  };

  if (description == undefined){
    description = "";
  };
  if (explanation == undefined){
    explanation = "";
  };
  if (imgTopic == undefined){
    imgTopic = "";
  };

  DB.child("topics").push({title: title, description: description, explanation: explanation, imgTopic: imgTopic});
}

function showTopic(topicUid){

  //show header
  DB.child("topics/"+topicUid).once("value", function(dataSnapshot){
    var title = dataSnapshot.val().title;
     convertTemplate("#topicHeaderTitle-tmpl", {topic: title}, "#headerTitle");
  });
  //show questions in topic
  showTopicQuestions (topicUid);
}

//show topic questions
function showTopicQuestions(topicUid){

  //get topic questions
  DB.child("topics/"+ topicUid.toString()+"/topics").on("value",function(questions){

    if(questions.exists()){

      var questionsUnderTopic = questions.val();
      var numberOfQuestions = Object.keys(questionsUnderTopic).length;
      var questionsArray = new Array();

      var i = 1;

      questions.forEach(function(question){

        DB.child("questions/"+question.key).once("value", function(data){

          var preContext = new Object();

          if (data.exists()){

            var title = data.val().title;
            var description = data.val().description;
  //          console.log("t: "+ title + ", d: "+ description);

            preContext = {
              uuid: question.key,
              title: title,
              description: description
            }

            topicsArray.push(preContext);
          }
          console.log("i = "+i+", numberOfQuestions = "+ numberOfQuestions);
          if (i === numberOfQuestions){
              var context = {groups: questionsArray};
              convertTemplate("#topicPage-tmpl", context, "wrapper");
            console.log("Push"+ JSON.stringify(context));
          }
          console.log(i);
          i++;
        })

      })
    } else {convertTemplate("#groupPage-tmpl",{}, "wrapper");}
  });
}
