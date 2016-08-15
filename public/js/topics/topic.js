//create new topic
function showTopic(topicUid){

   if (back == undefined){back = false}

   // userUpdates = DB.child("users/"+userUuid+"/updates/"+activeEntity.entity+"/"+activeEntity.uid);
   //
   // userUpdates.once('value', function(data) {
   //   userUpdatesSet = data.child("globalNotifications").exists();
   // });

   if (!back){
      setUrl("topic", topicUid);
   }

   var showTopicCallback = function(dataSnapshot){

      var title = dataSnapshot.val().title;
      renderTemplate("#topicHeaderTitle-tmpl", {topic: title}, "#headerTitle");
      renderTemplate("#headerMenu-tmpl", {chatUid: topicUid, entityType: "topics"}, "#headerMenu");
<<<<<<< HEAD
   });
   //show footer
   $("footer").html("");
=======

      $("footer").html();

   };

   setAcitveEntity("topics", topicUid, "value", showTopicCallback);
   //show questions in topic
   DB.child("topics/"+topicUid).once("value", showTopicCallback);
   showTopicQuestions (topicUid);



}
>>>>>>> master

   //show wrapper

   var topicCallback = function(questions){

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


                  preContext = {
                     uuid: question.key,
                     title: title,
                     description: description
                  }

                  questionsArray.push(preContext);
               }

               if (i === numberOfQuestions){
                  var context = {questions: questionsArray};
                  renderTemplate("#topicPage-tmpl", context, "wrapper");
                  $("wrapper").hide();
                  $("wrapper").fadeIn();

               }

               i++;
            });
         });
      } else {renderTemplate("#topicPage-tmpl",{}, "wrapper");}
   };
   //
   // DB.child("topics/"+ topicUid.toString()+"/questions").on("value",topicCallback);
   //
   // setActiveEntity("topics", topicUid, "value", topicCallback);




