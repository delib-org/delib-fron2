function listenToAuth(currentUrl){
  firebase.auth().onAuthStateChanged(function(user) {

    console.log("auth changed");

    if (user) {

      // User is signed in.
      $("#loginScreen").hide();
      userUuid = user.uid;
      userPhoto = user.photoURL;
      userEmail = user.email;
      userName = user.displayName;
      console.log(userName, userUuid)
      //write last login time
      DB.child("users/"+userUuid).update({lastLogin: firebase.database.ServerValue.TIMESTAMP, name: userName})

      if (userPhoto == null || userPhoto == undefined){
        userPhoto = "";
      }


      if(userName == null){
        userName = "Deliberator";
      } else {
        userName = user.displayName;
      }

      DB.child("users/"+user.uid).update({name: userName, email: user.email, userPhoto: userPhoto});

      initFeedManagerProps();
      updatesListener();

      console.log("login: "+ user.email, userName, user.uid);

      routTo(currentUrl);

    } else {
      // No user is signed in.
      console.log("No user is signed in.");

      userUuid = undefined;
      userName = undefined;
      userPhoto = undefined;
      userEmail = undefined;

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

function emailSignin(email, password, name){
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode, errorMessage);

    user.displayName = name;
    user.email = email;
  });
}

function emailLogin(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
}
