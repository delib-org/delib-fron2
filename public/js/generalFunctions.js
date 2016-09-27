function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function parseDate(dateInMillisec, format){
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

  switch (format){
    case "DDMMYY":
      return (year+" "+month+" "+dayInMonth);
      break;
    default:
      return (year+"-"+month+"-"+dayInMonth+" - "+hours+":"+minutes+":"+seconds);
  }


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
  var entityType = activeEntity.entityType;
  var entityUid = activeEntity.uid;

  showEntities(entityType,entityUid);
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
    case "chats":
      return "שיחה";
      break;
    default:
      console.log("unknowen entity");
      return undefined;
  }
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}


function playCough(){
  var cough = new Audio("sounds/Cough-SoundBible.com-1409703798.wav");
  cough.play();
}

function playCheer(){
  var cheer = new Audio("sounds/SMALLCROWDAPPLAUSEYannickLemieux1268806408.wav");
  cheer.play();
}


function moveFbRecord(oldRef, newRef) {
  oldRef.once('value', function(snap)  {
    newRef.set( snap.val(), function(error) {
      if( !error ) {  oldRef.remove(); }
      else if( typeof(console) !== 'undefined' && console.error ) {  console.error(error); }
    });
  });
}
