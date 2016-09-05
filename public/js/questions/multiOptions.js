

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

   var multiOptionsCallback = function(option){

      console.log("question is called, off dysfunc.");
      var optionUid = option.key;
      var description = option.val().description;
      description = replaceAll(description, "<br>", ". ");
      description = replaceAll(description, "<div>", ". ");
      description = replaceAll(description, "</div>", ". ");

      var title = option.val().title;
      var optionColor = option.val().color;

      adjustCounting(questionUid,optionUid);

      //check if user has voted. if not, set user vote to zero.
      var isSomebodyVoted = option.val().hasOwnProperty("thumbUp")
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

      var votes = option.val().votes;
      if (votes == undefined){ votes = 0};

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
      });
      var multiOptionsCallBack
      //if changes in votes, update text and position
      DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").on("value",function(currentVote) {
         $("#"+optionUid+"voteCount").text("בעד: "+ currentVote.val());

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
      })
   };

   var turnOff = function () {
      DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").orderByChild("dateAdded").limitToLast(20).off("child_added", multiOptionsCallback);
   };

   setActiveEntity("questions",questionUid, "child_added", multiOptionsCallback, turnOff);
}

function voteUpOption(questionUid, optionUid){
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
}
function orderAcccordingToVotes(questionUid){
   DB.child("questions/"+questionUid+"/options/").once("value",function(options){

   })
}

function addMultiOption(questionUid){

   DB.child("questions/"+questionUid+"/options").off("child_added");

   renderTemplate("#createMultiOption-tmpl",{}, "wrapper");
   renderTemplate("#createMultiOptionFooter-tmpl", {questionUid:questionUid}, "footer")
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
      var count = 0;
      thumbsUp.forEach(function(thumbUp){
         if(thumbUp.val()){ count++}

      });

      DB.child("questions/"+questionUid+"/options/"+optionUid+"/votes").set(count);
   })
}
