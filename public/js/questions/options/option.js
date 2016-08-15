function showOption(questionUid, optionUid){

   //show header
   DB.child("questions/"+questionUid+"/options/"+optionUid+"/title").once("value", function(titleInDB){
      renderTemplate("#optionHeaderTitle-tmpl", {title:titleInDB.val()}, "#headerTitle")
   })

   //show footer
   renderTemplate("#optionFooter-tmpl", {questionUid:questionUid}, "footer");

   //show wrapper
   DB.child("questions/"+questionUid+"/options/"+optionUid).once("value", function(optionDB){

      var description = optionDB.val().description;
      //      var writer = optionDB.val().writer;

      renderTemplate("#optionWrapper-tmpl", {questionUid:questionUid, optionUid:optionUid, description:description}, "wrapper")
   })

   $("#"+optionUid+"DivOpt").keypress(function(e) {
//      console.log(e.keyCode);
      var c = String.fromCharCode(e.which);
      console.log("key: "+ c);

      var description = $("#"+optionUid+"DivOpt").text();
      description = description+c;
      if (e.keyCode == 13){
         description = description+"\n"
         console.log("enter: "+description);
      }
      console.log(description);
      DB.child("questions/"+questionUid+"/options/"+optionUid).update({description:description, writer: userUuid});


   });

   //update wrapper
   DB.child("questions/"+questionUid+"/options/"+optionUid).on("value", function(optionDB){

      var description = optionDB.val().description;
      var writer = optionDB.val().writer;
      if (writer != userUuid){
         $("#"+optionUid+"DivOpt").html(description);
      }
   })

}

function updateOptionDescription(questionUid, optionUid){
   var description = $("#"+optionUid+"DivOpt").text();
   console.log(this, questionUid, optionUid, description);
   DB.child("questions/"+questionUid+"/options/"+optionUid).update({description:description, writer: userUuid});
}

//create option
function createOption(questionUid, title, description, explanation){

   var color = getRandomColor();

   if(description == "" || description == undefined){
      description = "";
   }
   if(explanation == "" || explanation == undefined){
      explanation = "";
   }

   if(title == "" || title == undefined){
      console.log("Eror: title = "+ title);
   } else {
      DB.child("questions/"+questionUid+"/options").push({title: title, description: description, explanation: explanation, color:color, ownerUid: userUuid});
   }
}

function openOptionMenu(optionUid){
   if ($("#optionMenu"+optionUid).is(":visible")){
      $("#optionMenu"+optionUid).hide(400);
   } else {
      $("#optionMenu"+optionUid).show(400);
   }

}

function editOption(questionUid, optionUid){

   renderTemplate("#editMultiOptionFooter-tmpl", {questionUid:questionUid, optionUid: optionUid}, "footer");
   renderTemplate("#createMultiOption-tmpl", {}, "wrapper");

   DB.child("questions/"+questionUid+"/options/"+optionUid).once("value", function(dataSnapshot){
      var title = dataSnapshot.val().title;
      var description = dataSnapshot.val().description;
      $("#createMultiOptionName").val(title);
      $("#createMultiOptionDescription").text(description);
   })


}

function editMultiOptionToDB (questionUid, optionUid){

   var title =  $("#createMultiOptionName").val();
   var description = $("#createMultiOptionDescription").val();

   console.log(title, description);
   DB.child("questions/"+questionUid+"/options/"+optionUid).update({title: title, description:description});

   showMultiOptions(questionUid);
}

//show option info in limited options

function showOptionInfo(question, option){

   if ($("#info").is(":visible")){
      $("#info").hide(400);
   } else{

      DB.child("questions/"+question+"/options/"+option).once("value", function(dataSnapshot){

         var title = dataSnapshot.val().title;
         var description = dataSnapshot.val().description;
         var explanation = dataSnapshot.val().explanation;

         var context = {title: title, description: description, explanation: explanation}

         renderTemplate("#optionsInfo-tmpl", context, "#info");

         //get wrapper dimentions
         var headerHeight = $("header").height();
         var wrapperHeight = $("wrapper").height();
         var footerHeight = $("footer").height();
         var infoHeight = wrapperHeight-footerHeight;
         var headerWidth = $("header").width();

         $("#info").css("top", headerHeight).css("height", infoHeight).css("width", headerWidth).show(400);

      })


   }
}
