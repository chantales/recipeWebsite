// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaFwUkn50NhSRt3FgS68lidSap4NqyPxk",
  authDomain: "listofrecipes-d88b8.firebaseapp.com",
  databaseURL: "https://listofrecipes-d88b8-default-rtdb.firebaseio.com",
  projectId: "listofrecipes-d88b8",
  storageBucket: "listofrecipes-d88b8.firebasestorage.app",
  messagingSenderId: "147673777707",
  appId: "1:147673777707:web:9c9a187722377fec470c6e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import {getDatabase, set, get, update, remove, ref, child}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const db = getDatabase();


function searchBarFunction() {
      // Declare variables
      var input, filter, ul, li, a, i, txtValue;
      input = document.getElementById('searchBarInput');
      filter = input.value.toUpperCase();
      ul = document.getElementById("searchList");
      li = ul.getElementsByTagName('li');
    
      // Loop through all list items, and hide those who don't match the search query
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    }