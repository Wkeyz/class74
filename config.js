import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyAfEfS23bJK_qSH0FsW2R5h4db9Au40qvA",
    authDomain: "bookapp-f9fec.firebaseapp.com",
    projectId: "bookapp-f9fec",
    storageBucket: "bookapp-f9fec.appspot.com",
    messagingSenderId: "32991876357",
    appId: "1:32991876357:web:71643b18c849125dcfd36c"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()