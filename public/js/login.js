	//store url string for one session (data is lost when the browser tab is closed)
		//check browser's locaStorgae support
//var sUrl;
//	if (typeof (Storage) !== "undefined") {
//		sUrl = getUrl();
//		sessionStorage.setItem("_urlAfterLogin", sUrl);
//		var tempEntityType = sUrl.split("/");
//		var entityType = tempEntityType[0].slice(0,tempEntityType[0].length);
//		var currentEntity = tempEntityType[1].slice(0,tempEntityType[1].length);
//
//		sessionStorage.setItem("_entityType", entityType);
//		sessionStorage.setItem("_currentEntity", currentEntity);
//
//		console.log("\nurl in storage for LOGIN: ", sessionStorage.getItem("_urlAfterLogin"));
//		console.log("\nurl entity type in storage for LOGIN: ", sessionStorage.getItem("_entityType"));
//		}
//		else {
//			alert("Sorry, your browser does not support local storage.\n You will be delivered to the main page.")
//		};


function listenToAuth(){

   firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

      // User is signed in.
      $("#loginScreen").hide(300);
      userUuid = user.uid;

      DB.child("users/"+user.uid).update({name: user.displayName});
      updatesListener();


       listenToNotifications(user.uid);
       console.log("login: "+ user.uid);

       console.log("user is login an redirected");
//       routTo(startingUrl);

      console.log("logddddd");
    } else {
      // No user is signed in.
      console.log("No user is signed in.");
      //show login screen
      renderTemplate("#login-tmpl",{},"#loginScreen");
      $("#loginScreen").show(300);
    }
  });
}


//Google login
function googleLogin() {
  var provider2 = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider2);

}
//Facebook login
function facebookLogin(){
  var provider = new firebase.auth.FacebookAuthProvider();
  firebase.auth().signInWithRedirect(provider);
}

function signout(){
  firebase.auth().signOut().then(function() {
    console.log("sign out");
  }, function(error) {
    console.log("Error: "+ error)
  });
}

//Autentication promise
firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    var userName = result.credential.user;
    console.log("token: "+ token);
  }

}).catch(function(error) {
  // Handle Errors here.
  console.log(error);
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  console.log("FB error: " + email+ ", "+errorMessage + ", "+errorCode + ", "+ credential);
  // ...
});

$("#signup-form").submit(function(e){
  e.preventDefault();
  console.log(this.email.value+ ", "+ this.pass.value);
  firebase.auth().createUserWithEmailAndPassword(this.email.value, this.pass.value).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Error: "+ errorMessage+" : "+ errorCode);
  });
});

$("#login-form").submit(function(e){
  e.preventDefault();
  firebase.auth().signInWithEmailAndPassword(this.email.value, this.pass.value).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Error: "+ errorMessage+" : "+ errorCode);
  });
});
