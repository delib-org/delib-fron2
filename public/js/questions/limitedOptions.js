function showLimitedOptionsQuestion(questionUid, numberOfOptions){

   var questionDB = DB.child("questions/"+questionUid+"/options");

   questionDB.off("value");
   questionDB.orderByChild("votes").limitToLast(numberOfOptions).once("value",function(options){

      if(options.exists()){
         setUrl("question", questionUid);
      } else {
         console.log("ERROR: no options exists");
      }

      var maxVotes = 0;

      var optionsArray = new Array();
      options.forEach(function(option){
         var color = option.val().color;
         if (color == undefined){
            var color = getRandomColor();
            DB.child("questions/"+questionUid+"/options/"+option.key).update({color:color});
         }

         optionsArray.push({uuid: option.key, title: option.val().title, votes: option.val().votes,color: color});


         if (maxVotes<option.val().votes){
            maxVotes = option.val().votes;
         }
      })

      var preContext = new Array();

      //    optionsArray.reverse();
      for (i in optionsArray){

         preContext.push({questionUuid: questionUid ,uuid: optionsArray[i].uuid, title: optionsArray[i].title, votes: optionsArray[i].votes , color: optionsArray[i].color});

      }
      var context = {options: preContext};
      console.log("rendering")
      renderTemplate("#simpleVote-tmpl", context, "wrapper");
      renderTemplate("#simpleVoteBtns-tmpl", context, "footer");

      var NumberOfOptionsActualy = optionsArray.length;

      var divBarWidth = $("wrapper").width()/NumberOfOptionsActualy;
      var barWidth = 0.8*divBarWidth;

      var wrapperHeight = $("wrapper").height() - $("footer").height()-20;

      var minimumVotesToAdjust = 20;
      var x=1;

      if (maxVotes<=minimumVotesToAdjust){
         x= maxVotes/minimumVotesToAdjust
      }

      for (i in optionsArray){
         var relativeToMaxBar = (optionsArray[i].votes/maxVotes)*x;

         $("#"+optionsArray[i].uuid+"_div").css('height', wrapperHeight*relativeToMaxBar).css("width", barWidth);
         $("#"+optionsArray[i].uuid+"_btn").css("background-color", optionsArray[i].color);
      }

      $(".voteBtn").ePulse({
         bgColor: "#ded9d9",
         size: 'medium'
      });
   })

   lightCheckedBtn(questionUid);
}

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
