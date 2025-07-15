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
import {getDatabase, set, ref, push}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const database = getDatabase();


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
    };



const form = document.getElementById("recipeForm");
const instructionsContainer = document.getElementById("instructionsContainer");
const addStepBtn = document.getElementById("addStepBtn");

let stepCount = 0;
console.log("code updated 1")
addStep();

    function addStep(initialValue = "") {
      stepCount++;
      console.log("step function was activated");

      const stepDiv = document.createElement("div");
      stepDiv.classList.add("step-container");

      const stepLabel = document.createElement("div");
      stepLabel.classList.add("step-number");

      const stepInput = document.createElement("input");
      stepInput.type = "text";
      stepInput.value = initialValue;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "X";
      removeBtn.classList.add("remove-btn")

      removeBtn.addEventListener("click", () => {
        instructionsContainer.removeChild(stepDiv);
        updateStepNumbers();
      });

      stepDiv.appendChild(stepLabel);
      stepDiv.appendChild(stepInput);
      stepDiv.appendChild(removeBtn);
      instructionsContainer.appendChild(stepDiv);
    }

    function updateStepNumbers() {
      stepCount = 0;
      instructionsContainer.querySelectorAll(".step-container").forEach((div) => {
        stepCount++;
        div.querySelector(".step-number").textContent = `Step ${stepCount}:`;
      });
    }









    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("titleOfRecipe").value.trim();
      const tagsString = document.getElementById("tags").value.trim();
      const cookingTime = document.getElementById("cookingTimeOfRecipe").value.trim();
      const ingredientsString = document.getElementById("ingredientsOfRecipe").value.trim();

      const tags = tagsString
        ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag !== "")
        : [];

      const ingredients = ingredientsString
        ? ingredientsString.split("\n").map(line => line.trim()).filter(line => line !== "")
        : [];

    
      const instructionInputs = instructionsContainer.querySelectorAll("input");
      const instructions = Array.from(instructionInputs)
        .map(input => input.value.trim())
        .filter(line => line !== "");

      const recipe = {
        title,
        tags,
        cookingTime,
        ingredients,
        instructions
      };

      const recipesRef = ref(database, "recipes");
      const newRecipeRef = push(recipesRef);

      set(newRecipeRef, recipe)
        .then(() => {
          alert("Recipe saved successfully!");
          form.reset();
          instructionsContainer.innerHTML = "";
          stepCount = 0;
          addStep(); // start fresh
        })
        .catch((error) => {
          console.error("Error saving recipe:", error);
          alert("something went wrong :(");
        });
    });



