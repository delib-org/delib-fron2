function getRandomColor() {
   var letters = '0123456789ABCDEF'.split('');
   var color = '#';
   for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
   }
   return color;
}

function parseDate(dateInMillisec){
   var d=new Date(dateInMillisec);

   var dayInMonth="0"+d.getDate();
   dayInMonth = dayInMonth.slice(-2);


   var month=d.getMonth();
   var monthsNames = ["ינואר", "פברואר", "מרץ", "ארפיל", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אור'", "נוב'", "דצמ'"];
   month = monthsNames[month];

   var year=d.getYear()+1900;

   var minutes="0"+d.getMinutes();
   minutes = minutes.slice(-2);

   var hours="0"+d.getHours();
   hours = hours.slice(-2);

   var seconds="0"+d.getSeconds();
   seconds = seconds.slice(-2);

   return (year+"-"+month+"-"+dayInMonth+" - "+hours+":"+minutes+":"+seconds);

}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function animateHeader(){
   $("header").hide();
   $("header").show(400);
}

function isNotEmpty(variable){
   if (variable != null || variable != undefined || variable != "" ){
      return true;
   } else {
      return false;
   }
}

function back(){
   var entity = activeEntity.entity;

   switch (entity){
      case "groups":
         showOwnedGroups();
         break;
      case "topics":
         showGroup(activeEntity.uid);
         break;
      case "questions":
         showTopic(activeEntity.uid);
      default:
         showOwnedGroups();
   }
}

function entityTypeToHebrew (entityType){
   switch (entityType){
      case "groups":
         return "קבוצה";
         break;
      case "topics":
         return "נושא";
         break;
      case "questions":
         return "שאלה";
         break;
      default:
         console.log("unknowen entity");
         return undefined;
   }
}

Handlebars.registerHelper('breaklines', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
});


