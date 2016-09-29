var optionsTempInput = new Array();

var numberOfOptions_g = 2;

function showAddNewQuestionScreen(){

  for (i=1;i<9;i++){
    optionsTempInput["option"+i]={title:"", description:""};
  }

  renderTemplate("#createQuestion-tmpl",{}, "wrapper");
  renderTemplate("#createQuestionFooter-tmpl",{}, "footer");

  renderTemplate("#questionOptionsLimitedOptions-tmpl", {}, "#questionOptions");

  $("#entitiesPanel").slideUp();

  setNumberOfOptions(numberOfOptions_g);

  var preContext = new Array();
  renderTemplate("#questionOptionsLimitedOptions-tmpl", {}, "#questionOptions");
  for (i=0;i<8;i++){
    preContext.push({optionOrder:i, optionUid: "option"+i, description:""})
  }
  var context = {options: preContext}
  renderTemplate("#questionOption-tmpl", context, "#optionsForLimitedOptions");

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

};


function setNumberOfOptions(numberOfOptions){

  numberOfOptions_g = numberOfOptions;

  //color the menu
  for (i=2; i<9;i++){
    $("#numberOfOptions"+i).css("background", "linear-gradient(to bottom,  #cc0000 0%,#cc3535 52%,#6d0000 100%)");
  }
  $("#numberOfOptions"+numberOfOptions).css("background", "linear-gradient(to top,  #cc0000 0%,#cc3535 52%,#6d0000 100%)");

  for (i=1; i<9;i++){
    if (i<numberOfOptions){
      $("#"+i+"_optionOrder").show();
    } else {
      $("#"+i+"_optionOrder").hide();
    }
  }
}

function addNewQuestion(questionUid){

  //get form info
  var questionName = $("#quesionTitle").val();
  var questionDescription = $("#questionDescription").val();
  var questionType = $("input[name=type]:checked").val();

  if (questionName == "") {
    alert("חסר שם שאלה");
    return;
  }

  if (userUuid == "" || userUuid == undefined) {
    alert("אנא התחבר/י למערכת");
    return;
  }


  //get options
  //   $('input[name=radioName]:checked', '#myForm').val()
  var radioInput  = $('input[type=radio][name=type]:checked').val();


  if (radioInput == "limitedOptions"){
    var limitiedOptionsArray = new Object();
    for (i=0; i<9; i++){
      var optionTitle = $("#option"+i+"_limitedOptions").val();
      var optionDescription = $("#option"+i+"_limitedOptionsDesc").val();

      if (optionTitle != "" && optionTitle != null){
        var color = getRandomColor();

        limitiedOptionsArray["option"+i]= {title: optionTitle, description: optionDescription, color:color} ;
      }
    }

    if (Object.keys(limitiedOptionsArray).length <2){
      alert("Not enough options. Please add more options bellow");
      return;
    }
  }


  if (questionUid == undefined){
    //setting new question

    var newQuestion = setNewQuestionToDB(questionName,questionDescription,questionType, limitiedOptionsArray);

    DB.child("users/"+userUuid+"/questions/"+newQuestion.key).set("owner");

  } else {
    //updating question
    console.log("updateing question")
    var parentEntityType = activeEntity.entityType;
    var parentUid = activeEntity.uid;

    if (questionType == "limitedOptions"){
      //if question type = limitedOptions

      DB.child("questions/"+questionUid).update({title: questionName, description: questionDescription, type: questionType, numberOfOptions: numberOfOptions_g, options:limitiedOptionsArray, parentEntityType: parentEntityType, parentEntityUid: parentUid});

    } else {

      DB.child("questions/"+questionUid).update({title: questionName, description: questionDescription, type: questionType, numberOfOptions: numberOfOptions_g, parentEntityType: parentEntityType, parentEntityUid: parentUid});
    }
  }
  console.log(activeEntity.entityType, activeEntity.uid);
  showEntities(activeEntity.entityType, activeEntity.uid);
}


//create new question
function setNewQuestionToDB (title, description, type, limitedOptionsArray){
  console.log("type: "+type)
  if (title == undefined){
    title = "";
    console.log("Error: new topic do not have title");
  };

  if (description == undefined){
    description = "";
  };
  //   if (type == undefined){
  //      explanation = "";
  //   };

  for (i=1;i<9;i++){
    if (optionsTempInput["option"+i].title == ""){
      delete optionsTempInput["option"+i];
    } else {
      if (optionsTempInput["option"+i].color == null){
        optionsTempInput["option"+i].color = getRandomColor();
      }
    }
  }

  var parentEntityType = activeEntity.entityType;
  var parentUid = activeEntity.uid;

  if (type == "limitedOptions"){
    var questionId = DB.child("questions").push({dateAdded: firebase.database.ServerValue.TIMESTAMP, title: title, description: description, type: type, numberOfOptions: numberOfOptions_g, options:limitedOptionsArray, owner: userUuid, parentEntityType: parentEntityType, parentEntityUid: parentUid});
  } else {
    var questionId = DB.child("questions").push({dateAdded: firebase.database.ServerValue.TIMESTAMP, title: title, description: description, type: type, numberOfOptions: numberOfOptions_g, owner: userUuid, parentEntityType: parentEntityType, parentEntityUid: parentUid});
  }


  //set question to be subEntity of parent entity
  DB.child(activeEntity.entityType+"/"+activeEntity.uid+"/subEntities/"+questionId.key).set({entityType: "questions", dateAdded: firebase.database.ServerValue.TIMESTAMP, order: 1});

  //set in question who is it's parentEntities
  console.log("questionUid: "+ questionId.key);
  DB.child("questions/"+questionId.key+"/parentEntities/"+activeEntity.entityType+"/"+activeEntity.uid).set(true);


  return questionId;
}

