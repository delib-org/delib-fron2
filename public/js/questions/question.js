function showQuestion(questionUid){

   //show header & get question info
   DB.child("questions/"+questionUid).once("value", function(dataSnapshot){
      var title = dataSnapshot.val().title;
      var description = dataSnapshot.val().description;

      renderTemplate("#questionHeaderTitle-tmpl", {question: title}, "#headerTitle");
      renderTemplate("#headerMenu-tmpl",{type:"questions", uid:questionUid},"#headerMenu");
      showBreadCrumb("questions", questionUid,title)

      var description = dataSnapshot.val().description;
      var typeOfQuestion = dataSnapshot.val().type;
      var numberOfOptions = dataSnapshot.val().numberOfOptions;

      switch (typeOfQuestion){
         case "limitedOptions":
            showLimitedOptionsQuestion(questionUid, numberOfOptions);
            break;
         case "multiOptions":
            showMultiOptions(questionUid);
            break;
         default:
            showLimitedOptionsQuestion(questionUid, numberOfOptions);
      }
   }).then(function(rendered) {
      subsManager.isUpdatesSet();
   });






   //  if (back == undefined){back = false};
   //
   //  if (!back){
   //    setUrl("question", questionUid);
   //  }

}

//function showLimitedOptionsQuestion(questionUid, numberOfOptions){
//  DB.child("questions/"+questionUid+"/options").orderByChild("order").limitToLast(numberOfOptions).on("value",function(options){
//
//    if(options.exists()){
//      setUrl("question", questionUid);
//    }
//    var maxVotes = 0;
//
//    var optionsObject = new Array();
//    options.forEach(function(option){
//      var color = option.val().color;
//      if (color == undefined){
//        var color = getRandomColor();
//        DB.child("questions/"+questionUid+"/options/"+option.key).update({color:color});
//      }
//
//      optionsObject.push({uuid: option.key, title: option.val().title, votes: option.val().votes,color: color});
//
//
//      if (maxVotes<option.val().votes){
//        maxVotes = option.val().votes;
//      }
//    })
//
//    var preContext = new Array();
//
//    //    optionsObject.reverse();
//    for (i in optionsObject){
//
//      preContext.push({questionUuid: questionUid ,uuid: optionsObject[i].uuid, title: optionsObject[i].title, votes: optionsObject[i].votes , color: optionsObject[i].color});
//
//    }
//    var context = {options: preContext};
//    renderTemplate("#simpleVote-tmpl", context, "wrapper");
//    renderTemplate("#simpleVoteBtns-tmpl", context, "footer");
//    $("wrapper").hide();
//    $("wrapper").show(700);
//
//    var NumberOfOptionsActualy = optionsObject.length;
//
//    var divBarWidth = $("wrapper").width()/NumberOfOptionsActualy;
//    var barWidth = 0.8*divBarWidth;
//
//    var wrapperHeight = $("wrapper").height() - $("footer").height()-20;
//
//    var minimumVotesToAdjust = 20;
//    var x=1;
//
//    if (maxVotes<=minimumVotesToAdjust){
//      x= maxVotes/minimumVotesToAdjust
//    }
//
//    for (i in optionsObject){
//      var relativeToMaxBar = (optionsObject[i].votes/maxVotes)*x;
//
//      $("#"+optionsObject[i].uuid+"_div").css('height', wrapperHeight*relativeToMaxBar).css("width", barWidth);
//      $("#"+optionsObject[i].uuid+"_btn").css("background-color", optionsObject[i].color);
//    }
//
//    $(".voteBtn").ePulse({
//      bgColor: "#ded9d9",
//      size: 'medium'
//    });
//  })
//
//  lightCheckedBtn(questionUid);
//}

function voteSimple(questionUid, optionUid){

   $("#info").hide(400);
   var optionUidStr = JSON.stringify(optionUid);
   //check to see what have the user voted last

   DB.child("questions/"+questionUid+"/simpleVoting/"+userUuid).once("value", function(vote){
      var isExists = vote.exists();

      if (!isExists){
         DB.child("questions/"+questionUid+"/simpleVoting/"+userUuid).set(optionUid);

         DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").transaction(function(currentVote){
            return currentVote +1;
         })
         $(".voteBtn").css("border" , "0px solid black");
         $("#"+optionUid+"_btn").css("border" , "3px solid black");
      } else {
         var lastVoted = vote.val();
         if (optionUid == lastVoted){
            DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").transaction(function(currentVote){
               return currentVote -1;
            })
            DB.child("questions/"+questionUid+"/simpleVoting/"+userUuid).remove();

            $(".voteBtn").css("border" , "0px solid black");
         } else {
            DB.child("questions/"+questionUid+"/options/"+lastVoted+"/votes").transaction(function(currentVote){
               return currentVote -1;
            });
            DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").transaction(function(currentVote){
               return currentVote +1;
            })
            DB.child("questions/"+questionUid+"/simpleVoting/"+userUuid).set(optionUid);
            $(".voteBtn").css("border" , "0px solid black");
            $("#"+optionUid+"_btn").css("border" , "3px solid black");
         }

      }
   })
}

function lightCheckedBtn(questionUid){
   DB.child("questions/"+questionUid+"/simpleVoting/"+userUuid).once("value", function(checkedOption){

      $(".voteBtn").css("border" , "0px solid black");
      $("#"+checkedOption.val()+"_btn").css("border" , "3px solid black");
   })
}


