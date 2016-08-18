$(function(){

//   if ('serviceWorker' in navigator) {
//      console.log('Service Worker is supported');
//      navigator.serviceWorker.register('../delib-service-worker.js').then(function() {
//         return navigator.serviceWorker.ready;
//      }).then(function(serviceWorkerRegistration) {
//         SWreg = serviceWorkerRegistration;
//         // fcmNotificationsBtn.disabled = false;
//         console.log('Service Worker is ready :^)', SWreg);
//      }).catch(function(error) {
//         console.log('Service Worker Error :^(', error);
//      });
//   }

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
   startingUrl = currentUrl;
   routTo(currentUrl);
    console.log("rout to.. app.js");
   listenToAuth();


//   setFeeds();

   //routTo(currentUrl, false);

   $(window).on('popstate', function() {

      console.log("rout to.. popstate");
      var currentUrl = getUrl();
      var back = true;
      routTo(currentUrl,back);

    });
    //
    // renderTemplate("#LogoHeaderTitle-tmpl",{},"#headerTitle");
    // renderTemplate("#headerBreadCrumbs-tmpl",{},"#headerBreadCrumbs");
    // renderTemplate("#headerMenu-tmpl",{},"#headerMenu");

    listenToAuth();
});

// Global General Variables and Constants

var userUuid;
var startingUrl;
var activeEntity = new Object();
var entitiesCallbacks = new Object();
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

var subsManager = {
    isUpdatesSet: function(){
        this.isFeedSet();
        this.isNotificationsSet();

    },
    setFeed: function(){},
    isFeedSet: function(){},
    setNotifications: function(){},
    isNotificationsSet: function(){},
    userFeed: null,
    feedIsSet: false,
    userNotifications: null,
    notificationsIsSet: false
};

var mostUpdatedContent = null;
// Feed
var feedQueue = [];
const feedVolume = 3;
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
