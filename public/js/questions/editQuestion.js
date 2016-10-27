function questionsEdit(questionUid){


  //bring data from DB
  DB.child("questions/"+questionUid).once("value", function(dataSnapshot){

    var numberOfOptions = dataSnapshot.val().numberOfOptions;
    var questionTitle = dataSnapshot.val().title;
    var questionDescription = dataSnapshot.val().description;
    var typeOfQuestion = dataSnapshot.val().type;

    //      showAddNewQuestionScreen();
    renderTemplate("#createQuestion-tmpl",{}, "wrapper");
    renderTemplate("#editQuestionFooter-tmpl",{uid: questionUid}, "footer");
    renderTemplate("#questionOptionsLimitedOptions-tmpl", {}, "#questionOptions");


    $("#quesionTitle").val(questionTitle);
    $("#questionDescription").val(questionDescription);

    document.questionTypeForm.type.value=typeOfQuestion;
    setNumberOfOptions(numberOfOptions);

    showOptionsInUpdate(questionUid, numberOfOptions);
    //get most voted options and show them

    //listen to radio buttons changes
    $('input[type=radio][name=type]').change(function(){

      var selection = this.value;

      switch (selection) {
        case "multiOptions":
          $("#questionOptions").slideUp();
          break;
        case "limitedOptions":
          $("#questionOptions").slideDown();
          break;
        default:
          $("#questionOptions").hide();
      }
    })

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



  DB.child("questions/"+questionUid).update({title: title, description: description, type: type, numberOfOptions: numberOfOptions_g});

  for (i in editiedOptions){
    //get new name and description
    var optionUid = $("[option-number='"+i+"']").attr('id');
    console.log("optionUid: "+optionUid);
    var titleOption = $("#"+editiedOptions[i]+"_limitedOptions").val();
    var descriptionOption = $("#"+editiedOptions[i]+"_limitedOptionsDesc").val();
    console.log("title of "+editiedOptions[i]+" is: "+titleOption, descriptionOption);
    if (titleOption != undefined){
      DB.child("questions/"+questionUid+"/options/"+optionUid).update({title:titleOption, description:descriptionOption});
    }
  }
  DB.child("questions/"+questionUid+"/options").update(optionsTempInput);
  DB.child("questions/"+questionUid).update({numberOfOptions:numberOfOptions_g});

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
    var questionType = optionsObj.val().type;

    if (questionType == "limitedOption"){
      $("#questionOptions").show();
    } else {
      $("#questionOptions").hide();
    }

    var numbeOfOptions = Object.keys(optionsObj.val()).length;
    var optionNumber = 8;

    for (i = numbeOfOptions; i<8 ; i++){
      prependTemplate("#questionOptionSingle-tmpl", {title:"", description: "", optionUid: i, optionNumber:optionNumber}, "#optionsForLimitedOptions");
      optionNumber--;
    }


    optionsObj.forEach(function(optionObj){

      var title = optionObj.val().title;
      var description = optionObj.val().description;
      var uid = optionObj.key;
      console.log(title, description, uid)

      prependTemplate("#questionOptionSingle-tmpl", {title:title, description: description, optionUid: uid, optionNumber:optionNumber }, "#optionsForLimitedOptions");
      optionNumber--;
    })

  })
}

//
//    var optionsArray = new Array() ;
//
//    optionsObj.forEach(function(optionObj){
//      optionsArray.push({title: optionObj.val().title, description: optionObj.val().description})
//
//    })
//    optionsArray.reverse();
//    for (i=0;i<optionsArray.length;i++){
//      $("#option"+i+"_limitedOptions").val(optionsArray[i].title);
//      $("#option"+i+"_limitedOptionsDesc").val(optionsArray[i].description);
//    }
//
//  })

