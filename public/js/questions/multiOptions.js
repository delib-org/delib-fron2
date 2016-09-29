function showMultiOptions(questionUid){


  var optionsPosition = new Array();
  var optionsObject = new Array();
  var optionsObjectOrder = new Array();

  //show header
  //coming from question.js/showQuestion()

  //show footer
  renderTemplate("#multiOptionsFooter-tmpl",{questionUid: questionUid}, "footer");
  $("wrapper").html("");

  var indexDiv = 0;

  var votesCallBack = function(currentVote){
    $("#"+currentVote.key+"voteCount").text("בעד: "+ currentVote.val().votes);

    //see if changes in locations
    //get new order
    DB.child("questions/"+questionUid+"/options").orderByChild("votes").once("value", function(options){
      var newOrder = new Array();
      options.forEach(function(option){
        newOrder.push(option.key);
      })

      var isDifference = false;
      var newOrderLength = newOrder.length;

      for (i in newOrder){
        if(newOrder[i] == optionsPosition[i]){

        } else {
          isDifference = true;
          var oldPostionLocation = $("#"+optionsPosition[i]+"Div").position();
        }
      }
      if (isDifference){
        var numberOfNewDivs = newOrder.length;
        for (i in newOrder){
          $("#"+newOrder[i]+"Div").animate({top:((numberOfNewDivs-i)*87)-70},1500, "easeOutElastic");
        }
      }
      optionsPosition = newOrder;
    })
  };

  var multiOptionsCallback = function(option){


    var optionUid = option.key;
    var description = option.val().description;
    description = replaceAll(description, "<br>", ". ");
    description = replaceAll(description, "<div>", ". ");
    description = replaceAll(description, "</div>", ". ");

    var title = option.val().title;
    var optionColor = option.val().color;

    adjustCounting(questionUid,optionUid);

    //check if user has voted. if not, set user vote to zero.
    var isSomebodyVoted = option.val().hasOwnProperty("thumbUp");

    if (isSomebodyVoted){
      var isUserVoted = option.val().thumbUp.hasOwnProperty(userUuid);
    } else {
      isUserVoted = false;
    }
    if (!isUserVoted){
      DB.child("questions/"+questionUid+"/options/"+optionUid+"/thumbUp/"+userUuid).set(false);
      var userVote = false;

    } else {
      var userVote = option.val().thumbUp[userUuid];

    }

    //show thumbUp as active if user is voted, on to inactive if user didn't vote
    var votes = option.val().votes;
    if (votes == undefined){ votes = 0}

    if (userVote) {
      userVote = "img/thumbUpActive.png";
    } else {
      userVote = "img/thumbUpInactive.png";
    }

    optionsPosition.push(optionUid);

    prependTemplate("#multiOption-tmpl",{title:title, description: description, questionUid: questionUid, optionUid: optionUid, optionColor:optionColor, votes:votes, userVote: userVote}, "wrapper");
    $("#optionMenu"+optionUid).hide();

    $("#"+optionUid+"Div").css("top", (indexDiv*87)+17);
    indexDiv++;

    //check user update voteSimoble
    DB.child("questions/"+questionUid+"/options/"+optionUid+"/thumbUp/"+userUuid).on("value",function(isThumbUp){
      if(isThumbUp.val()){
        $("#"+optionUid+"voteImg").attr("src", "img/thumbUpActive.png");
      } else {
        $("#"+optionUid+"voteImg").attr("src", "img/thumbUpInactive.png");
      }
    })
    //if changes in votes, update text and position
    DB.child("questions/"+questionUid+"/options/"+optionUid).on("value", votesCallBack)
  };

  DB.child("questions/"+questionUid+"/options").orderByChild("votes").on("child_added", multiOptionsCallback);

  var turnOff = function (){

    DB.child("questions/"+questionUid+"/options").orderByChild("votes").off("child_added", multiOptionsCallback);
  };

  setActiveEntity("questions",questionUid, "child_added", multiOptionsCallback, turnOff);
}

function voteUpOption(questionUid, optionUid){
  //check if member of group
  DB.child("questions/"+questionUid+"/parentEntityUid").once("value", function(parentEntityUidDB){
    //if question has a parent
    if (parentEntityUidDB.val() != null) {

      DB.child("groups/"+parentEntityUidDB.val()+"/members/"+userUuid).once("value", function(userMember){
        //if user is a member
        if (userMember.val() != null){
          //vote and devote
          DB.child("questions/"+questionUid+"/options/"+optionUid+"/thumbUp/"+userUuid).once("value", function(thumbUp){
            if (thumbUp.val()){
              DB.child("questions/"+questionUid+"/options/"+optionUid+"/thumbUp/"+userUuid).set(false);
              DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").transaction(function(currentVote){
                return currentVote -1;
              });
              $("#"+optionUid+"voteImg").attr("src", "img/thumbUpInactive.png");
            } else {
              DB.child("questions/"+questionUid+"/options/"+optionUid+"/thumbUp/"+userUuid).set(true);
              DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").transaction(function(currentVote){
                return currentVote +1;
              });
              $("#"+optionUid+"voteImg").attr("src", "img/thumbUpActive.png");
            }
          })
        } else { alert("You have to be a member in this group to vote")}
      })
    }
  })



}
function orderAcccordingToVotes(questionUid){
  DB.child("questions/"+questionUid+"/options/").once("value",function(options){

  })
}

function addMultiOption(questionUid){

  DB.child("questions/"+questionUid+"/options").off("child_added");

  renderTemplate("#createMultiOption-tmpl",{}, "wrapper");
  renderTemplate("#createMultiOptionFooter-tmpl", {questionUid:questionUid}, "footer");
  $("wrapper").css("overflow","auto");
}

function addMultiOptionToDB(questionUid){
  var title = $("#createMultiOptionName").val();
  var description = $("#createMultiOptionDescription").val();

  if (title == ""){
    alert("Title can't be empty");
    return;
  }

  createOption(questionUid, title, description);

  showMultiOptions(questionUid);
}

function adjustCounting(questionUid, optionUid){
  DB.child("questions/"+questionUid+"/options/"+optionUid+"/thumbUp").once("value", function(thumbsUp){
    //get numbe of true
    var count = 0
    thumbsUp.forEach(function(thumbUp){
      if(thumbUp.val()){ count++}

    })

    DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").set(count);
  })
}
