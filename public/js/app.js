$(function(){

  //start ripple effect
  $(".footer-btn").ePulse({

    bgColor: "#ded9d9",
    size: 'medium'

  });

  $(".headerMenuBtn").ePulse({
    bgColor: "#ded9d9",
    size: 'medium'
  });

  var currentUrl = decodeURIComponent(getUrl());
  console.log("currentUrl:" + currentUrl);

  startingUrl = currentUrl;
  //   routTo(currentUrl);

  listenToAuth(currentUrl);


  $(window).on('popstate', function() {

    console.log("rout to.. popstate");
    var currentUrl = getUrl();
    var back = true;
    routTo(currentUrl,back);

    window.scrollTo(0,1);

  });
});


// Global General Variables and Constants

var userUuid;
var userName;
var userEmail;
var userPhoto;
var startingUrl;
var activeEntity = new Object();
var firstRun = true;

const subEntity = {
  groups: "topics"
  , topics: "questions"
  , questions: "options"
  , chat: "room"
  , liveTalks: "live Talk"
};
const toHebrew = {
  groups: "קבוצה חדשה: "
  , topics: "נושא חדש: "
  , questions: "שאלה חדשה: "
  , owner: "קריאה: "
  , chats: "הודעה חדשה מ:"
  , liveTalks: "שיחה חדשה: "
};
var inactiveColor = "#5f1f1f";
var activeColor = "white";
var pendingColor = "#c78100";

// Updates Variables and Constants
var updatesRegulator = {
  latestContentLocal: {
    latest: null
  }
};

// subsManager Def.
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

// Feed ========================================================================================

// default feed volume
const defaultFeedVolume = 10;
// entrance 
// queue and inbox getters and setters defined in logic.js
var feedManager = {
  volume: defaultFeedVolume
};

//==================================================================================

const symbols = {
  groups: "fa fa-users",
  topics: "fa fa-folder-open",
  questions: "fa fa-question-circle",
  options: "fa fa-file-text",
  liveTalks: "fa fa-eye",
  chats:"fa fa-comments-o"
}

//============// Initialize Firebase
var config = {
  apiKey: "AIzaSyAjyyjWM63PSjyRoDI-87MpRtfOFnOO0aA",
  authDomain: "delib21-aaeb0.firebaseapp.com",
  databaseURL: "https://delib21-aaeb0.firebaseio.com",
  storageBucket: "delib21-aaeb0.appspot.com"
};

firebase.initializeApp(config);
var DB = firebase.database().ref();
var storage = firebase.storage();



