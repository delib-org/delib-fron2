$(function(){

   if ('serviceWorker' in navigator) {
      console.log('Service Worker is supported');
      navigator.serviceWorker.register('../delib-service-worker.js').then(function() {
         return navigator.serviceWorker.ready;
      }).then(function(serviceWorkerRegistration) {
         SWreg = serviceWorkerRegistration;
         // fcmNotificationsBtn.disabled = false;
         console.log('Service Worker is ready :^)', SWreg);
      }).catch(function(error) {
         console.log('Service Worker Error :^(', error);
      });
   }

   //start ripple effect
   $(".footer-btn").ePulse({
      bgColor: "#ded9d9",
      size: 'medium'

   });
   $(".headerMenuBtn").ePulse({
      bgColor: "#ded9d9",
      size: 'medium'

   });

   var currentUrl = getUrl();

   routTo(currentUrl, false);
   //  showPublicGroups();
   $(window).on('popstate', function() {
      var currentUrl = getUrl();
      var back = true;
      routTo(currentUrl,back);

   });

   //
   renderTemplate("#LogoHeaderTitle-tmpl",{},"#headerTitle");
   renderTemplate("#headerBreadCrumbs-tmpl",{},"#headerBreadCrumbs");
   renderTemplate("#headerMenu-tmpl",{},"#headerMenu");
   //  goHome();

   listenToAuth();
})

// Global General Variables and Constants

var userUuid;
var activeEntity = new Object();
var firstRun = true;
const subEntity = {
	groups: "topics"
	, topics: "questions"
	, questions: "options"
	, chat: "room"
};
const toHebrew = {
	groups: "קבוצה חדשה: "
	, topics: "נושא חדש: "
	, questions: "שאלה חדשה: "
	, owner: "קריאה: "
	, chats: "הודעה חדשה מ:"
};
var inactiveColor = "#5f1f1f";
var activeColor = "white";
// Updates Variables and Constants
var userUpdates;
var userUpdatesSet;
var mostUpdatedContent = null;
// Feed
var feedQueue = [];
const feedVolume = 20;
// Initialize Firebase
var config = {
	apiKey: "AIzaSyBEumZUTCL3Jc9pt7_CjiSVTxmz9aMqSvo"
	, authDomain: "synthesistalyaron.firebaseapp.com"
	, databaseURL: "https://synthesistalyaron.firebaseio.com"
	, storageBucket: "gs://synthesistalyaron.appspot.com"
};
firebase.initializeApp(config);
var DB = firebase.database().ref();
var storage = firebase.storage();
