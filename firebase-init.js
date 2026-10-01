/* =========================================================
   CONEXIÓN CON FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBCr0OkRC1EoZBOjlahECkYZNkbwrxzF4U",
    authDomain: "taquito-y-volea.firebaseapp.com",
    projectId: "taquito-y-volea",
    storageBucket: "taquito-y-volea.firebasestorage.app",
    messagingSenderId: "897670151205",
    appId: "1:897670151205:web:0f31bcf552e959ea4d93cc"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();