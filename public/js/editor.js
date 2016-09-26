//function createQuillEditor(elementUid){
//
//    var checkConsole = function(){
//        console.log("\n\nclickEvent");
//    }
//
//    var toolbarOptions = [
//      [{ 'align': [] }],
//      [{ 'direction': 'rtl' }],
//      ['bold', 'italic', 'underline'],
//      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//      [{ 'size': ['small', false, 'large', 'huge'] }],
//      ['clean']
//    ];
//
//    var options = {
//      debug: 'info',
//      modules: {
//          toolbar: toolbarOptions
//    },
//      theme: 'snow',
//      readOnly: false,
//    };
//
//    var editor = new Quill(elementUid, options);
//
//}


function showOption(questionUid, optionUid) {
    console.log("showOption: " + questionUid, optionUid)
        //show header
    DB.child("questions/" + questionUid + "/options/" + optionUid + "/title").once("value", function (titleInDB) {
        renderTemplate("#optionHeaderTitle-tmpl", {
            title: titleInDB.val()
        }, "#headerTitle")
    })

    renderTemplate("#headerMenu-tmpl", {
        chatUid: optionUid,
        entityType: "options"
    }, "#headerMenu");

    //show footer
    renderTemplate("#optionFooter-tmpl", {
        questionUid: questionUid
    }, "footer");

   //show wrapper
   DB.child("questions/"+questionUid+"/options/"+optionUid).once("value", function(dataSnapshot){

        var description = dataSnapshot.val().description;

        renderTemplate("#optionWrapper-tmpl", {
            questionUid: questionUid,
            optionUid: optionUid,
            description: description
        }, "wrapper");
        $('wrapper').html("<div id='" + optionUid + "DivOpt' class='card' contenteditable='true' >"+description+"</div>")
        $('wrapper').html("<div id='"+optionUid+"DivOpt' class='card'>"+description+"</div>")

        createQuillEditor("#" + optionUid + "DivOpt");
//        tinymce.init({ selector:"#" + optionUid + "DivOpt" });

    });

   $("#"+optionUid+"DivOpt").keyup(function(e) {
      //
      var description = $("#"+optionUid+"DivOpt").html();
      console.log("text: "+description);

        DB.child("questions/" + questionUid + "/options/" + optionUid).update({
            description: description,
            writer: userUuid
        });
    });

    $(".ql-toolbar span").click(function () {
        var description = $("#" + optionUid + "DivOpt").html();
        console.log("\n\n-Toolbar click: " + description);

        DB.child("questions/" + questionUid + "/options/" + optionUid).update({
            description: description,
            writer: userUuid
        });
    });

   //update wrapper

   var updateWrapperOption = function(optionDB){

      var descriptionFromDB = optionDB.val().description;
      var writer = optionDB.val().writer;

        if (writer != userUuid) {
            console.log("write");
            $("#" + optionUid + "DivOpt").html(descriptionFromDB);
        }
    }

   DB.child("questions/"+questionUid+"/options/"+optionUid).on("value", updateWrapperOption);

   var turnOff = function () {
      DB.child("questions/"+questionUid+"/options/"+optionUid).off("value", updateWrapperOption);
   };


   //setActive entity
   DB.child("questions/"+questionUid+"/options/"+optionUid).once("value", function(dataSnapshot){
      var optionKey = dataSnapshot.val().optionKey;
      setActiveEntity("options", optionKey, "value", updateWrapperOption, turnOff);
   })


}

function updateOptionDescription(questionUid, optionUid) {
    var description = $("#" + optionUid + "DivOpt").text();
    console.log(this, questionUid, optionUid, description);
    DB.child("questions/" + questionUid + "/options/" + optionUid).update({
        description: description,
        writer: userUuid
    });
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

    if (title == "" || title == undefined) {
        console.log("Eror: title = " + title);
    } else {
        var optionUidDB = DB.child("questions/" + questionUid + "/options").push({
            title: title,
            description: description,
            explanation: explanation,
            color: color,
            ownerUid: userUuid
        });

        var optionKeyDB = DB.child("options").push({
            questionUid: questionUid,
            optionUid: optionUidDB.key
        });

        DB.child("questions/" + questionUid + "/options/" + optionUidDB.key).update({
            optionKey: optionKeyDB.key
        });
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

    renderTemplate("#editMultiOptionFooter-tmpl", {
        questionUid: questionUid,
        optionUid: optionUid
    }, "footer");
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
    DB.child("questions/" + questionUid + "/options/" + optionUid).update({
        title: title,
        description: description
    });

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

            var context = {
                title: title,
                description: description,
                explanation: explanation
            }

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
