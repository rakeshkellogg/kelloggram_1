const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {        apiKey: "AIzaSyCL3rd5YzjaEFgkwPjVt7b6S88l83yF17w",
        authDomain: "kiei-451-1.firebaseapp.com",
        projectId: "kiei-451-1",
        storageBucket: "kiei-451-1.appspot.com",
        messagingSenderId: "477799429261",
        appId: "1:477799429261:web:259f53b86ee7a04ada5ec4"} // replace

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase