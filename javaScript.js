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

const app = initializeApp(firebaseConfig);
import {getDatabase, set, ref, push, get} 
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const database = getDatabase(app);


// Detect which page is being read
const pageType = document.body.dataset.page || "list";

// ==== COMMON THINGS ====
const recipesRef = ref(database, "recipes");

let allRecipesList = [];





// ==== RECIPE LIST PAGE LOGIC ====
if (pageType === "list") {
    const form = document.getElementById("recipeForm");
    const instructionsContainer = document.getElementById("instructionsContainer");
    const addStepBtn = document.getElementById("addStepBtn");
    const saveRecipeBtn = document.getElementById("saveRecipeBtn");
    const pullAllRecipes = document.getElementById("pullAllRecipes");

    const mealButtons = document.querySelectorAll("#mealDropD .dropDBtn");
    const dietaryButtons = document.querySelectorAll("#dietDropD .dropDBtn");
    const searchInputBar = document.getElementById("searchInputBar");

    let tags = [];
    let dietarySpef = [];
    let stepCount = 0;

    function renderFilteredRecipes(query) {
        pullAllRecipes.innerHTML = "";
        const filtered = allRecipesList.filter(([id, recipe]) => {
            const matchesTitle = recipe.title.toLowerCase().includes(query.toLowerCase());
            const matchesTags = tags.length === 0 || tags.every(tag => recipe.tags?.includes(tag));
            const matchesDiet = dietarySpef.length === 0 || dietarySpef.every(diet => recipe.dietarySpef?.includes(diet));
            return matchesTitle && matchesTags && matchesDiet;
        });

        filtered.forEach(([id, recipe]) => {
            const recipeDiv = displayRecipe(recipe, id);
            pullAllRecipes.appendChild(recipeDiv);
        });
    }

    document.getElementById("mealFilterBtn").addEventListener("click", () => {
        document.getElementById("mealDropD").classList.toggle("show");
    });

    document.getElementById("dietFilterBtn").addEventListener("click", () => {
        document.getElementById("dietDropD").classList.toggle("show");
    });

    document.getElementById("searchBtn").addEventListener("click", () => {
        renderFilteredRecipes(searchInputBar.value);
    });

    document.getElementById("addRecpBtn").addEventListener("click", () => {
        document.getElementById("addRecpDropD").classList.toggle("show");
    });

    function updateSelectedFilters() {
        const filterDisplay = [...tags, ...dietarySpef];
        document.getElementById("filterTags").textContent = filterDisplay.length
            ? filterDisplay.join(", ")
            : "None";
    }

    // Filter buttons
    mealButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tag = btn.dataset.tag;
            btn.classList.toggle("selected");
            tags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
            updateSelectedFilters();
            renderFilteredRecipes(searchInputBar.value);
        });
    });

    dietaryButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const diet = btn.dataset.tag;
            btn.classList.toggle("selected");
            dietarySpef = dietarySpef.includes(diet) ? dietarySpef.filter(d => d !== diet) : [...dietarySpef, diet];
            updateSelectedFilters();
            renderFilteredRecipes(searchInputBar.value);
        });
    });

    // Add step logic
    function addStep(initialValue = "") {
        stepCount++;
        const stepDiv = document.createElement("div");
        stepDiv.classList.add("stepContainer");

        const stepLabel = document.createElement("div");
        stepLabel.classList.add("stepNumber");
        stepLabel.textContent = `Step ${stepCount}:`;

        const stepInput = document.createElement("input");
        stepInput.type = "text";
        stepInput.value = initialValue;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "X";
        removeBtn.classList.add("removeBtn");
        removeBtn.addEventListener("click", () => {
            instructionsContainer.removeChild(stepDiv);
            updateStepNumbers();
        });

        stepDiv.append(stepLabel, stepInput, removeBtn);
        instructionsContainer.appendChild(stepDiv);
    }

    function updateStepNumbers() {
        stepCount = 0;
        instructionsContainer.querySelectorAll(".stepContainer").forEach((div) => {
            stepCount++;
            const stepLabel = div.querySelector(".stepNumber");
            if (stepLabel) stepLabel.textContent = `Step ${stepCount}:`;
        });
    }

    addStepBtn.addEventListener("click", () => addStep());
    addStep();

    saveRecipeBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const instructionInputs = instructionsContainer.querySelectorAll("input");
        const instructions = Array.from(instructionInputs).map(input => input.value.trim()).filter(line => line !== "");

        const title = document.getElementById("titleOfRecipe").value.trim();
        const prepTime = document.getElementById("prepTimeOfRecipe").value.trim();
        const cookingTime = document.getElementById("cookingTimeOfRecipe").value.trim();
        const ingredientsString = document.getElementById("ingredientsOfRecipe").value.trim();

        if (!title || !prepTime || !cookingTime || tags.length === 0 || dietarySpef.length === 0 || !ingredientsString || instructions.length === 0) {
            alert("You have not completed the recipe.");
            return;
        }

        const ingredients = ingredientsString ? ingredientsString.split("\n").map(line => line.trim()).filter(line => line !== "") : [];

        const recipe = { title, tags, dietarySpef, prepTime, cookingTime, ingredients, instructions };

        const newRecipeRef = push(recipesRef);
        set(newRecipeRef, recipe)
            .then(() => {
                alert("Recipe saved successfully!");
                form.reset();
                instructionsContainer.innerHTML = "";
                stepCount = 0;
                addStep();
            })
            .catch((error) => {
                console.error("Error saving recipe:", error);
                alert("Something went wrong :(");
            });
    });

    get(recipesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                allRecipesList = Object.entries(snapshot.val());
                renderFilteredRecipes("");
            } else {
                pullAllRecipes.innerHTML = "<p>No recipes found.</p>";
            }
        })
        .catch((error) => console.error("Error loading recipes:", error));

    function displayRecipe(recipe, ID) {
        const recipeDiv = document.createElement("div");
        recipeDiv.classList.add("recipeCard");
        recipeDiv.innerHTML = `
            <h3><a href="recipe.html?id=${ID}" target="_blank">${recipe.title}</a></h3>
            <p><h3>Tags:</h3> ${recipe.tags?.join(", ") || "None"}</p>
            <p><h3>Dietary Specifications:</h3> ${recipe.dietarySpef?.join(", ") || "None"}</p>
            <p><h3>Ingredients:</h3><br>${recipe.ingredients?.join("<br>") || "None"}</p>
            <hr>
        `;
        return recipeDiv;
    }
}







// ==== RECIPE DETAIL PAGE LOGIC ====
if (pageType === "detail") {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get("id");

    const recipeTitle = document.getElementById("recipeTitle");
    const recipeDetails = document.getElementById("recipeDetails");

    if (recipeId) {
        const recipeRef = ref(database, "recipes/" + recipeId);
        get(recipeRef).then(snapshot => {
            if (snapshot.exists()) {
                const recipe = snapshot.val();
                recipeTitle.textContent = recipe.title;
                recipeDetails.innerHTML = `
                    <p><strong>Tags:</strong> ${recipe.tags?.join(", ") || "None"}</p>
                    <p><strong>Dietary Specifications:</strong> ${recipe.dietarySpef?.join(", ") || "None"}</p>
                    <p><strong>Preparing Time:</strong> ${recipe.prepTime || "?"} mins</p>
                    <p><strong>Cooking Time:</strong> ${recipe.cookingTime || "?"} mins</p>
                    <p><strong>Ingredients:</strong><br>${recipe.ingredients?.join("<br>") || "None"}</p>
                    <p><strong>Instructions:</strong><br>${recipe.instructions?.map((s, i) => `Step ${i + 1}: ${s}`).join("<br>") || "None"}</p>
                `;
            } else {
                recipeTitle.textContent = "Recipe not found.";
            }
        }).catch(error => {
            console.error(error);
            recipeTitle.textContent = "Error loading recipe.";
        });
    } else {
        recipeTitle.textContent = "No recipe ID provided.";
    }
}







// ==== MEAL PLAN PAGE LOGIC ====
if (pageType === "mealplan") {
  
let mealPlan = {};

// Pull all recipes first
get(ref(database, "recipes")).then(snapshot => {
  if (snapshot.exists()) {
    allRecipesList = Object.entries(snapshot.val());
    setupMealPlanUI();
  } else {
    document.getElementById("recipeList").innerHTML = "No recipes found!";
  }
}).catch(console.error);

function setupMealPlanUI() {
  document.querySelectorAll(".addRecipeBtn").forEach(button => {
    button.addEventListener("click", () => {
      const mealSlot = button.closest(".mealSlot");
      const dayDiv = button.closest(".day");
      const day = dayDiv.dataset.day;
      const meal = mealSlot.dataset.meal;

      showRecipeChoices(mealSlot.querySelector(".recipeChoices"), day, meal);
    });
  });

  updateMealPlanUI();
}

function showRecipeChoices(container, day, meal) {
  // Show the container
  container.style.display = "block";
  container.innerHTML = "";

  // Filter recipes by meal tag
  const filteredRecipes = allRecipesList.filter(([id, recipe]) =>
    recipe.tags?.some(tag => tag.toLowerCase() === meal.toLowerCase())
  );

  if (filteredRecipes.length === 0) {
    container.innerHTML = "<p>No recipes for this meal.</p>";
    return;
  }

  filteredRecipes.forEach(([id, recipe]) => {
    const div = document.createElement("div");
    div.className = "recipeChoice";
    div.textContent = recipe.title;
    div.style.cursor = "pointer";
    div.addEventListener("click", () => {
      addToMealPlan(day, meal, id);
      container.style.display = "none";  // Hide choices after selection
      updateMealPlanUI();
    });
    container.appendChild(div);
  });
}

function addToMealPlan(day, meal, recipeId) {
  if (!mealPlan[day]) mealPlan[day] = {};
  if (!mealPlan[day][meal]) mealPlan[day][meal] = [];
  mealPlan[day][meal].push(recipeId);
}

function updateMealPlanUI() {
  document.querySelectorAll(".day").forEach(dayDiv => {
    const dayName = dayDiv.dataset.day;
    dayDiv.querySelectorAll(".mealSlot").forEach(slot => {
      const mealName = slot.dataset.meal;
      const recipesForMeal = mealPlan[dayName]?.[mealName] || [];
      const list = slot.querySelector(".recipeList");
      list.innerHTML = recipesForMeal
        .map(id => {
          const recipe = allRecipesList.find(([rid]) => rid === id)?.[1];
          return `<li>${recipe?.title || "Unknown"}</li>`;
        }).join("");
    });
  });
}


document.getElementById("saveMealPlan").addEventListener("click", () => {
  const mealPlansRef = ref(database, "mealPlans");
  const newRef = push(mealPlansRef);
  set(newRef, mealPlan)
    .then(() => alert("Saved meal plan!"))
    .catch(console.error);
});






}

