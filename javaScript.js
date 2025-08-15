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
import {getDatabase, set, ref, push, get, remove} 
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const database = getDatabase(app);


// Detect which page is being read
const pageType = document.body.dataset.page || "list";


// ==== COMMON THINGS ====
const recipesRef = ref(database, "recipes");
const params = new URLSearchParams(window.location.search);
let allRecipesList = [];

function objKeysToArray(obj) {
  return obj ? Object.keys(obj) : [];
}

console.log("code!?")





// ==== RECIPE LIST PAGE LOGIC ====
if (pageType === "r-list") {
  const form = document.getElementById("recipeForm");
  const instructCont = document.getElementById("instructionsContainer");
  const addStepBtn = document.getElementById("addStepBtn");
  const saveRecipeBtn = document.getElementById("saveRecipeBtn");
  const pullAllRecipes = document.getElementById("pullAllRecipes");

  const mealButtons = document.querySelectorAll("#mealDropD .dropDBtn");
  const dietaryButtons = document.querySelectorAll("#dietDropD .dropDBtn");

  const tagAddBtn = document.querySelectorAll(".tagBtn");
  const dietAddBtn = document.querySelectorAll(".dietSpefBtn");

  const searchInputBar = document.getElementById("searchInputBar");

  let tags = [];
  let dietarySpef = [];
  let stepCount = 0;



  // search bar picking up the recipes based in whats being searched in real time
  searchInputBar.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    showFilteredRecipes(query);
  });
  

  // filters the recipes
  function showFilteredRecipes(query) {
    pullAllRecipes.innerHTML = "";
    const filtered = allRecipesList.filter(([id, recipe]) => {
      const tagsArr = objKeysToArray(recipe.tags);
      const dietArr = objKeysToArray(recipe.dietarySpef);
  
      const matchesTitle = recipe.title.toLowerCase().includes(query.toLowerCase());
      const matchesTags = tags.length === 0 || tags.every(tag => tagsArr.includes(tag));
      const matchesDiet = dietarySpef.length === 0 || dietarySpef.every(diet => dietArr.includes(diet));
      return matchesTitle && matchesTags && matchesDiet;
    });
  
    filtered.forEach(([id, recipe]) => {
      const recipeDiv = displayRecipe(recipe, id);
      pullAllRecipes.appendChild(recipeDiv);
    });
  }

  function updateYourFilters() {
    const filterDisplay = [...tags, ...dietarySpef];
    document.getElementById("filterTags").textContent = filterDisplay.length
        ? filterDisplay.join(", ")
        : "None";
  }



document.getElementById("mealFilterBtn").addEventListener("click", () => {
    document.getElementById("mealDropD").classList.toggle("show");
});

document.getElementById("dietFilterBtn").addEventListener("click", () => {
    document.getElementById("dietDropD").classList.toggle("show");
});


document.getElementById("addRecpBtn").addEventListener("click", () => {
    document.getElementById("addRecpDropD").classList.toggle("show");
});


  // Filter buttons
  mealButtons.forEach(btn => {
      btn.addEventListener("click", () => {
          const tag = btn.dataset.tag;
          btn.classList.toggle("selected");
          tags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
          updateYourFilters();
          showFilteredRecipes(searchInputBar.value);


          console.log(tags);
      });
  });

  dietaryButtons.forEach(btn => {
      btn.addEventListener("click", () => {
          const diet = btn.dataset.tag;
          btn.classList.toggle("selected");
          dietarySpef = dietarySpef.includes(diet) ? dietarySpef.filter(d => d !== diet) : [...dietarySpef, diet];
          updateYourFilters();
          showFilteredRecipes(searchInputBar.value);


          console.log(dietarySpef);
      });
  });



  // add recipe buttons
  tagAddBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;
      btn.classList.toggle("selected");
      if (tags.includes(tag)) {
        tags = tags.filter(t => t !== tag);
      } else {
        tags.push(tag);
      }
      console.log("tags:", tags);
    });
  });

  dietAddBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      const diet = btn.dataset.tag;
      btn.classList.toggle("selected");
      if (dietarySpef.includes(diet)) {
        dietarySpef = dietarySpef.filter(d => d !== diet);
      } else {
        dietarySpef.push(diet);
      }
      console.log("dietary spefs:", dietarySpef);
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
      instructCont.removeChild(stepDiv);
        updateStepNumbers();
    });

    stepDiv.append(stepLabel, stepInput, removeBtn);
    instructCont.appendChild(stepDiv);
  }

  function updateStepNumbers() {
    stepCount = 0;
    instructCont.querySelectorAll(".stepContainer").forEach((div) => {
        stepCount++;
        const stepLabel = div.querySelector(".stepNumber");
        if (stepLabel) stepLabel.textContent = `Step ${stepCount}:`;
    });
  }

  addStepBtn.addEventListener("click", () => addStep());
  addStep();










  function arrayToObj(arr) {
    const obj = {};
    arr.forEach(item => {
      obj[item] = true;
    });
    return obj;
  }
    
// save recipe
saveRecipeBtn.addEventListener("click", (e) => {
e.preventDefault();

  const instructInputs = instructCont.querySelectorAll("input");
  
  const instructions = Array
  .from(instructInputs)
  .map(input => input.value.trim())
  .filter(line => line !== "");

  const title = document.getElementById("titleOfRecipe").value.trim();
  const prepTime = Number(document.getElementById("prepTimeOfRecipe").value.trim());
  const cookingTime = Number(document.getElementById("cookingTimeOfRecipe").value.trim());
  const ingredientsString = document.getElementById("ingredientsOfRecipe").value.trim();

    let ingredients;
    if (ingredientsString) {
      ingredients = ingredientsString
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "");
    } else {
      ingredients = [];
    };

    if (!title || !prepTime || !cookingTime || tags.length === 0 || dietarySpef.length === 0 || !ingredientsString || instructions.length === 0) {
          alert("You have not completed the recipe! Complete it!");
        return;
    };


    const recipe = { 
      title, 
      tags: arrayToObj(tags), 
      dietarySpef: arrayToObj(dietarySpef), 
      prepTime, 
      cookingTime, 
      ingredients, 
      instructions };

  const newRecipeRef = push(recipesRef);
  set(newRecipeRef, recipe)
  .then((btn) => {
      alert("Recipe saved successfully!!");
    form.reset();
    instructCont.innerHTML = "";
    stepCount = 0;
    addStep();
    btn.classList.remove("selected");
  })
});

// get recipes
  get(recipesRef)
  .then((snapshot) => {
      if (snapshot.exists()) {
          allRecipesList = Object.entries(snapshot.val());
          showFilteredRecipes("");
      } else {
          pullAllRecipes.innerHTML = "<p>No recipes found.</p>";
      }
  })

  // display recipes on the page
  function displayRecipe(recipe, ID) {
    const tagsArr = objKeysToArray(recipe.tags);
    const dietArr = objKeysToArray(recipe.dietarySpef);
    const ingredientsArr = Array.isArray(recipe.ingredients) ? recipe.ingredients : objKeysToArray(recipe.ingredients);
  
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipeCard");
    recipeDiv.innerHTML = `
      <h3>
        <a href="recipe.html?id=${ID}" target="_blank">${recipe.title}</a>
      </h3>
      <h4>Tags:</h4>
      <p>${tagsArr.join(", ") || "None"}</p>
      <h4>Dietary Specifications:</h4>
      <p>${dietArr.join(", ") || "None"}</p>
      <h4>Ingredients:</h4>
      <ul>
        ${ingredientsArr.map(i => `<li>${i}</li>`).join("") || "<li>None</li>"}
      </ul>
      <hr>
    `;
    return recipeDiv;
  }


}







// ==== RECIPE DETAIL PAGE LOGIC ====
if (pageType === "r-detail") {
    const recipeId = params.get("id");

    const recipeTitle = document.getElementById("recipeTitle");
    const recipeDetails = document.getElementById("recipeDetails");

    if (recipeId) {
        get(ref(database, "recipes/" + recipeId))
        .then(snapshot => {
            if (snapshot.exists()) {
                const recipe = snapshot.val();
                const tagsArr = objKeysToArray(recipe.tags);
                const dietArr = objKeysToArray(recipe.dietarySpef);
                const ingredientsArr = Array.isArray(recipe.ingredients) ? recipe.ingredients : objKeysToArray(recipe.ingredients);
                const instructionsArr = Array.isArray(recipe.instructions) ? recipe.instructions : objKeysToArray(recipe.instructions);

                recipeTitle.textContent = recipe.title;
                recipeDetails.innerHTML = `
                  <h3>Tags:</h3>
                  <p>${tagsArr.join(", ") || "None"}</p>
                
                  <h3>Dietary Specifications:</h3>
                  <p>${dietArr.join(", ") || "None"}</p>
                
                  <h3>Preparing Time:</h3>
                  <p>${recipe.prepTime || "?"} mins</p>
                
                  <h3>Cooking Time:</h3>
                  <p>${recipe.cookingTime || "?"} mins</p>
                
                  <h3>Ingredients:</h3>
                  <ul>
                      ${ingredientsArr.map(i => `<li>${i}</li>`).join("") || "<li>None</li>"}
                  </ul>
                
                  <h3>Instructions:</h3>
                  <ol>
                      ${instructionsArr.map(s => `<li>${s}</li>`).join("") || "<li>None</li>"}
                  </ol>
              `;
                                    
            } else {
                recipeTitle.textContent = "Sorry. Your recipe seems to have disappeared. We will send someone out to find it";
                document.getElementById("deleteRecipeBtn").style.display = "none";
                
            }
        }).catch(error => {
            recipeTitle.textContent = "Whoever went out to get your recipe got lost. Error will be sorted soon.";
            console.log(error)
        });
    } else {
        recipeTitle.textContent = "No recipe ID provided. Your recipe may have commited identitify theft.";
    }



  // deleting the recipe
  document.getElementById("deleteRecipeBtn").addEventListener("click", () => {
      if (!recipeId) {
          alert("No recipe ID provided.");
          return;
      }
      const recipeRef = ref(database, "recipes/" + recipeId);
      remove(recipeRef).then(() => {
          alert("Recipe deleted successfully!");
          window.location.href = "recipeList.html"; 
      }).catch(error => {
          alert("Error deleting recipe: " + error.message);
      });

  });

}







// ==== MEAL PLAN PAGE LOGIC ====
if (pageType === "mealplan") {
  
let mealPlan = {};
const mealPlansRef = ref(database, "mealPlans");
const container = document.getElementById("mealPlansList");


// Pull any saved mealplans onto the page for the user to be enamoured by my cool code
get(mealPlansRef).then(snapshot => {
  if (!snapshot.exists()) {
    container.textContent = "No meal plans saved.";
    return;
  }
  const plans = Object.entries(snapshot.val());
  plans.forEach(([id, data]) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <a href="mealPlan.html?id=${id}" target="_blank">
          Meal Plan for: ${data.date || "OOO scary the date is Unknown."}
        </a>
    `;
    container.appendChild(div);
  });
}).catch(console.error);



// Pull all recipes first
get(ref(database, "recipes")).then(snapshot => {
  if (snapshot.exists()) {
    allRecipesList = Object.entries(snapshot.val());
    setupMP();
  } else {
    document.getElementById("recipeList").innerHTML = "No recipes found!";
  }
}).catch(console.error);





document.getElementById("mealPlanBtn").addEventListener("click", () => {
  document.getElementById("mealPlanDropD").classList.toggle("show");
});


document.getElementById("dateMealPlan").addEventListener("change", e => {
  const date = new Date(e.target.value);
  const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });

  const dayDiv = document.querySelector(".day");
  dayDiv.dataset.day = dayName; 
  document.getElementById("dayName").textContent = dayName;
      updateMP();
});


function setupMP() {
  document.querySelectorAll(".addRecipeBtn").forEach(button => {
    button.addEventListener("click", () => {
      const mealSlot = button.closest(".mealSlot");
      const dayDiv = button.closest(".day");
      const day = dayDiv.dataset.day;
      const meal = mealSlot.dataset.meal;

      showRecipeChoices(mealSlot.querySelector(".recipeChoices"), day, meal);
    });
  });

  updateMP();
}

function showRecipeChoices(container, day, meal) {
  // Show the container
  container.style.display = "block";
  container.innerHTML = "";

  // Filter recipes by meal tag
  const filteredRecipes = allRecipesList.filter(([id, recipe]) => {
    const tagsArr = objKeysToArray(recipe.tags).map(t => t.toLowerCase());
    return tagsArr.includes(meal.toLowerCase());
  });

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
      addToMP(day, meal, id);
      container.style.display = "none";  // Hide choices after selection
      updateMP();
    });
    container.appendChild(div);
  });
}

function addToMP(day, meal, recipeId) {
  mealPlan[day] ??= {};
  mealPlan[day][meal] = recipeId;
}

function updateMP() {
  document.querySelectorAll(".day").forEach(dayDiv => {
    const dayName = dayDiv.dataset.day;
    dayDiv.querySelectorAll(".mealSlot").forEach(slot => {
      const mealName = slot.dataset.meal;
      const recipeId = mealPlan[dayName]?.[mealName];
      const recipe = allRecipesList.find(([rid]) => rid === recipeId)?.[1];
      slot.querySelector(".recipeList").innerHTML = recipe
        ? `<li>${recipe.title}</li>`
        : "";
    });
  });
}


document.getElementById("saveMealPlan").addEventListener("click", () => {
  const mealPlansRef = ref(database, "mealPlans");
  const newRef = push(mealPlansRef);
  const date = document.getElementById("dateMealPlan").value;
  if (!date) {
    alert("Please enter a date for your meal plan.");
    return;
  }
  const mealPlanSave = {
    date, // save the date set
    dayName,     
    mplan: mealPlan, // the meal plan object
  };

  set(newRef, mealPlanSave)
  .then(() => alert("Saved meal plan!"))
  .catch(error => {
    if (error.code === 'PERMISSION_DENIED') {
      alert("Save failed: Date must be between 2025 and 2026.");
    } else {
      alert("Save failed: " + error.message);
    }
  });

});


}









// ==== MEAL PLAN DETAIL PAGE LOGIC ====
if (pageType === "mp-detail") {
  const mplanId = params.get("id");

  const mplanTitle = document.getElementById("mplanTitle");
  const mplanDetails = document.getElementById("mplanDetails");

  if (!mplanId) {
    mplanTitle.textContent = "No meal plan ID given.";
    mplanDetails.innerHTML = "";
  }


  get(recipesRef)
  .then(recipeSnapshot => {
    if (!recipeSnapshot.exists()) {
      mplanTitle.textContent = "No recipes found in database.";
      mplanDetails.innerHTML = "";
    }
    const allRecipesList = Object.entries(recipeSnapshot.val());


    const mplanRef = ref(database, "mealPlans/" + mplanId);
    return get(mplanRef).then(snapshot => {
      if (!snapshot.exists()) {
        mplanTitle.textContent = "Sorry, that meal plan could not be found.";
        mplanDetails.innerHTML = "";
        return;
      }
      const data = snapshot.val();
      mplanTitle.textContent = `Meal Plan for: ${data.date || "Unknown date"}`;


      const mealPlanObj = data.mplan || {};


      const html = Object.entries(mealPlanObj).map(([day, meals]) => {
        return `
          <h3>${day}</h3>
          <ul>
            ${Object.entries(meals).map(([mealName, recipeId]) => {
              const recipe = allRecipesList.find(([rid]) => rid === recipeId)?.[1];
              const title = recipe ? recipe.title : "Recipe not found";
              return `<li><strong>${mealName}:</strong> <a href="recipe.html?id=${recipeId}" target="_blank">${title}</a></li>`;
            }).join("")}
          </ul>
        `;
      }).join("");


      mplanDetails.innerHTML = html;
    });
  })
  .catch(error => {
    mplanTitle.textContent = "Error loading meal plan.";
    mplanDetails.innerHTML = "";
  }
    
  );
}








// ==== GROCERIES PAGE LOGIC ====
if (pageType == "groceries") {
  const mealPlansRef = ref(database, "mealPlans");
  const mealPlanSelect = document.getElementById("mealPlanSelector");
  const ingredientsList = document.getElementById("ingredientsList");

  get(mealPlansRef)
  .then(snapshot => {
    if (!snapshot.exists()) {
      mealPlanSelect.innerHTML = '<option value="">No meal plans found</option>';
      return;
    }
    for (const [id, plan] of Object.entries(snapshot.val())) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = plan.date || `Meal Plan ${id}`;
      mealPlanSelect.appendChild(option);
    }
  });




}