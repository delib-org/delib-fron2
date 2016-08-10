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
      var optionKey = DB.child("options").push({title: title, description: description, explanation: explanation, color:color});
      console.log("new option key is:", optionKey.key);
      DB.child("questions/"+questionUid+"/options/"+optionKey.key).set(true)
   }
}

function openOptionMenu(optionUid){
   if ($("#optionMenu"+optionUid).is(":visible")){
      $("#optionMenu"+optionUid).hide(400);
   } else {
      $("#optionMenu"+optionUid).show(400);
   }

}

function editOption(optionUid){

   renderTemplate("#editMultiOptionFooter-tmpl", {optionUid: optionUid}, "footer");
   renderTemplate("#createMultiOption-tmpl", {}, "wrapper");

   DB.child("options/"+optionUid).once("value", function(dataSnapshot){
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
