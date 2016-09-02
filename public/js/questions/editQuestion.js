function questionsEdit(questionUid){


   //bring data from DB
   DB.child("questions/"+questionUid).once("value", function(dataSnapshot){

      var numberOfOptions = dataSnapshot.val().numberOfOptions;
      var questionTitle = dataSnapshot.val().title;
      var questionDescription = dataSnapshot.val().description;
      var typeOfQuestion = dataSnapshot.val().type;

      showAddNewQuestionScreen();

      $("#quesionTitle").val(questionTitle);
      $("#questionDescription").val(questionDescription);

      document.questionTypeForm.type.value=typeOfQuestion;
//      setNumberOfOptions(numberOfOptions);

      showOptionsInUpdate(questionUid, numberOfOptions);


   });
}

function updateQuestion(questionUid){

   //get form info
   var title = $("#quesionTitle").val();
   var description = $("#questionDescription").val();
   var type = $("input[name=type]:checked").val();
   console.log("name: " + title + ", Question description: "+ description + ", type: " + type);

   if (title == "") {
      alert("חסר שם שאלה");
      return;
   }

   if (userUuid == "" || userUuid == undefined) {
      alert("אנא התחבר/י למערכת");
      return;
   }

   console.dir(optionsTempInput);
   console.log("numberOfOptions "+numberOfOptionsTemp );

   //   for (i=1;i<=numberOfOptionsTemp;i++){
   //      if (optionsTempInput["option"+i].title == "") {
   //         alert(" אופציה מספר "+i+" ריקה");
   //         return;
   //      }
   //   }
   //   for (i=numberOfOptionsTemp+1;i<9;i++){
   //      if (optionsTempInput["option"+i].title == "") {
   //         delete optionsTempInput["option"+i];
   //      }
   //
   //
   //   }

   console.dir(optionsTempInput);

   DB.child("questions/"+questionUid).update({title: title, description: description, type: type, numberOfOptions: numberOfOptionsTemp});

   for (i in editiedOptions){
      //get new name and description
      var titleOption = $("#"+editiedOptions[i]+"_limitedOptions").val();
      var descriptionOption = $("#"+editiedOptions[i]+"_limitedOptionsDesc").val();
      console.log("title of "+editiedOptions[i]+" is: "+titleOption, descriptionOption);
      if (titleOption != undefined){
         DB.child("questions/"+questionUid+"/options/"+editiedOptions[i]).update({title:titleOption, description:descriptionOption});
      }
   }
   DB.child("questions/"+questionUid+"/options").update(optionsTempInput);
   DB.child("questions/"+questionUid).update({numberOfOptions:numberOfOptionsTemp});

   showEntities(activeEntity.entityType, activeEntity.uid);
}

function switchBetweenTypesOfQuestions (questionUid, typeOfQuestion, numberOfOptions){
   switch (typeOfQuestion) {
      case "limitedOptions":
         $("#questionOptions").show(300);
         showOptionsInUpdate(questionUid);
         break;
      default:
         $("#questionOptions").hide(300);
   }
}

var editiedOptions = new Array();

function showOptionsInUpdate(questionUid){
   //get Options form DB
   DB.child("questions/"+questionUid+"/options").orderByChild("votes").limitToLast(8).once("value", function(optionsObj){

      var optionsArray = new Array() ;

      optionsObj.forEach(function(optionObj){
         optionsArray.push({title: optionObj.val().title, description: optionObj.val().description})

      })
      optionsArray.reverse();
      for (i=0;i<optionsArray.length;i++){
         $("#option"+i+"_limitedOptions").val(optionsArray[i].title);
         $("#option"+i+"_limitedOptionsDesc").val(optionsArray[i].description);
      }

   })
}
