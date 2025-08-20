import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {getDatabase, set, ref, push, get, remove}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

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
const auth = getAuth(app);


const database = getDatabase(app);


// Detect which page is being read
const pageType = document.body.dataset.page || "list";


// ==== COMMON THINGS ====
const recipesRef = ref(database, "recipes");
const params = new URLSearchParams(window.location.search);
let allRecipesList = [];

// Function to convert an object keys to an array
function objKeysToArray(obj) {
  return obj ? Object.keys(obj) : [];
}


console.log("help !!!")
// ==== AUTHRORIZATION PAGE LOGIC ====
if (pageType === "auth") {
  // Get form elements
  const userEmail = document.getElementById("userEmail");
  const userPassword = document.getElementById("userPassword");

  const signUpBtn = document.getElementById("signUpBtn");
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  


  // Track if user is logged in
  const authForm = document.getElementById("authForm");
  const logOut = document.getElementById("logOut");
  logOut.style.display = "none"; // hide the logout button by default

  const checkAuthState = async() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        authForm.style.display = "none"; // hide the sign in area
        logOut.style.display = "block"; // show the logout button
      } else {
        authForm.style.display = "block"; // show the sign in area
        logOut.style.display = "none"; // hide the logout button
      }
    });
  };

  checkAuthState();

  // Sign up a new user
  const userSignUp = async() => {
    const signUpEmail = userEmail.value;
    const signUpPassword = userPassword.value;

    createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User created:", user);
      alert("Your account has been created successfully!");
      window.open('https://chantales.github.io/recipeWebsite/index.html', '_blank'); 
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode + errorMessage);
    })
  }

  // Sign in esxisting user
  const userSignIn = async() => {
    const signInEmail = userEmail.value;
    const signInPassword = userPassword.value;

    signInWithEmailAndPassword(auth, signInEmail, signInPassword)
    .then((userCredential) => {
      const user = userCredential.user;
      alert("Your have signed in sucessfully.");
      window.open('https://chantales.github.io/recipeWebsite/index.html', '_blank'); 
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode + errorMessage);
    })
  }

  // Sign out existing user
   const userSignOut = async() => {
    await signOut(auth);
  }

  // Buttons for each action 
   signUpBtn.addEventListener("click", userSignUp);
   signInBtn.addEventListener("click", userSignIn);
   signOutBtn.addEventListener("click", userSignOut);
}


// ==== RECIPE LIST PAGE LOGIC ====
if (pageType === "r-list") {
  // Get form + recipe elements
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



  // Search bar filters recipes live
  searchInputBar.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    showFilteredRecipes(query);
  });
  

  // Filter recipes based on search query, tags selected, and dietary specs selected
  function showFilteredRecipes(query) {
    pullAllRecipes.innerHTML = "";
      const filtered = allRecipesList.filter(([id, recipe]) => {
        // Convert tag + diet objects into arrays (Firebase saves them as objects)
      const tagsArr = objKeysToArray(recipe.tags);
      const dietArr = objKeysToArray(recipe.dietarySpef);
  
      const matchesTitle = recipe.title.toLowerCase().includes(query.toLowerCase());
      const matchesTags = tags.length === 0 || tags.every(tag => tagsArr.includes(tag));
      const matchesDiet = dietarySpef.length === 0 || dietarySpef.every(diet => dietArr.includes(diet));
      return matchesTitle && matchesTags && matchesDiet;
      });
      
    // Display recipes that match either query, tags, or dietary spefs
    filtered.forEach(([id, recipe]) => {
      const recipeDiv = displayRecipe(recipe, id);
      pullAllRecipes.appendChild(recipeDiv);
    });
  }
  // Update the filter display to show selected tags and dietary specifications on the page
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


  // Filter tag buttons
  mealButtons.forEach(btn => {
      btn.addEventListener("click", () => {
          const tag = btn.dataset.tag; 
          btn.classList.toggle("selected");
          tags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]; // toggle the tag
          updateYourFilters();
          showFilteredRecipes(searchInputBar.value);
      });
  });

  dietaryButtons.forEach(btn => {
      btn.addEventListener("click", () => {
          const diet = btn.dataset.tag;
          btn.classList.toggle("selected");
          dietarySpef = dietarySpef.includes(diet) ? dietarySpef.filter(d => d !== diet) : [...dietarySpef, diet]; // toggle the dietary spef
          updateYourFilters();
          showFilteredRecipes(searchInputBar.value);
      });
  });


  document.getElementById("addRecpBtn").addEventListener("click", () => {
    document.getElementById("addRecpDropD").classList.toggle("show");
  });

  // Add recipe tag buttons
  tagAddBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;
      const isSelected = tags.includes(tag);

    if (isSelected) {
      tags = tags.filter(t => t !== tag); // remove the tag
      btn.classList.remove("selected");
    } else {
      if (tags.length < 3) { // only allows up to 3 tags per recipe
        tags.push(tag);
        btn.classList.add("selected");
      } else {
        alert("You can only select up to 3 tags.");
      }}
      console.log("tags:", tags);
    })
  });

  dietAddBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      const diet = btn.dataset.tag;
      const isSelected = dietarySpef.includes(diet);

    if (isSelected) {
      dietarySpef = dietarySpef.filter(d => d !== diet); // remove the dietary spef
      btn.classList.remove("selected");
    } else {
      if (diet === "none") {
        dietarySpef = ["none"];
        dietAddBtn.forEach(b => b.classList.remove("selected")); // deselect all buttons
        btn.classList.add("selected");
      } else {
        if (dietarySpef.includes("none")) {
          alert('You cannot select other dietary specs while "none" is selected.');
          return;
        }
        if (dietarySpef.length >= 3) { // only allows up to 3 tags per recipe
          alert("You can only select up to 3 dietary specifications.");
          return;
        }
        dietarySpef.push(diet);
        btn.classList.add("selected");
      }}
    })
  });


  // Add new step input space for instructions 
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
  // Update step numbers when a step is added or removed
  function updateStepNumbers() {
    stepCount = 0;
    instructCont.querySelectorAll(".stepContainer").forEach((div) => {
        stepCount++;
        const stepLabel = div.querySelector(".stepNumber");
        if (stepLabel) stepLabel.textContent = `Step ${stepCount}:`; // update the step number
    });
  }

  addStepBtn.addEventListener("click", () => addStep());
  addStep();

//  Function to convert an array to an object with keys as the array items
  function arrayToObj(arr) {
    const obj = {};
    arr.forEach(item => {
      obj[item] = true;
    });
    return obj;
  }
    
// Save recipe to Firebase
saveRecipeBtn.addEventListener("click", (e) => {
e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
  alert("You must be signed in to add a recipe!");
  return; // stop execution if no user is signed in
  }

  const instructInputs = instructCont.querySelectorAll("input");
  const instructions = Array
  .from(instructInputs)
  .map(input => input.value.trim())
  .filter(line => line !== "");

  // Get values from the form
  const title = document.getElementById("titleOfRecipe").value.trim();
  const prepTime = Number(document.getElementById("prepTimeOfRecipe").value.trim());
  const cookingTime = Number(document.getElementById("cookingTimeOfRecipe").value.trim());
  const ingredientsString = document.getElementById("ingredientsOfRecipe").value.trim();

  // Arrange ingredients into an array
    let ingredients;
    if (ingredientsString) {
      ingredients = [...new Set(
        ingredientsString
          .split("\n")
          .map(line => line.trim())
          .filter(line => line !== "")
      )];
    } else {
      ingredients = [];
    };


    // Section for not alloweds / rule breaking
    // Function to check if a string contains numbers
    function hasNumbers(str) {
      return /\d/.test(str);
    }
    
    // Function to check if a value is a number
    function isNumber(value) {
      return !isNaN(value) && value !== "";
    }

    const errors = [];
    // Text fields shouldn't have numbers
    if (!title) errors.push("Title is empty");
    else if (hasNumbers(title)) errors.push("Title cannot contain numbers");

    // Numeric fields shouldn't have letters
    if (!prepTime) errors.push("Prep time is incorrect");
    else if (!isNumber(prepTime) || prepTime < 1 || prepTime > 300) errors.push("Prep time must be a number between 1 and 300");

    if (!cookingTime) errors.push("Cooking time is incorrect");
    else if (!isNumber(cookingTime) || cookingTime < 1 || cookingTime > 300) errors.push("Cooking time must be a number between 1 and 300");

    // Ingredients
    if (!ingredientsString) errors.push("Ingredients are missing. With what will you make your food?");

    // Instructions
    if (!instructions.length) errors.push("Instructions are missing. How do we make this again?");

    // Tags and dietary specs
    if (!tags.length) errors.push("Please select at least one tag");
    if (!dietarySpef.length) errors.push("Please select at least one dietary specification");

    // Stop save if there are errors
    if (errors.length) {
    alert("Please fix the following errors:\n" + errors.join("\n"));
    return;
    }

    // Create the recipe object to save. Save with author ( current user UID )
    const recipe = { 
      title, 
      tags: arrayToObj(tags), 
      dietarySpef: arrayToObj(dietarySpef), 
      prepTime, 
      cookingTime, 
      ingredients, 
      instructions,
      author: user.uid };

  // Push new recipe into the database under "recipes"
  const newRecipeRef = push(recipesRef); // generate a unique ID for the new recipe (for future reference)
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

  // Load all recipes from Firebase at page load
  get(recipesRef)
  .then((snapshot) => {
      if (snapshot.exists()) {
          allRecipesList = Object.entries(snapshot.val());
          showFilteredRecipes("");
      } else {
          pullAllRecipes.innerHTML = "<p>No recipes found.</p>";
      }
  })

  // Display a recipe card for a recipe in html
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

    // Check if recipeId is given
    if (recipeId) {
        // Pull the recipe from the database by its ID
        // If recipeId is not given, display an error message
        get(ref(database, "recipes/" + recipeId))
        .then(snapshot => {
            if (snapshot.exists()) {
              // Display recipe elements
                const recipe = snapshot.val();
                const tagsArr = objKeysToArray(recipe.tags);
                const dietArr = objKeysToArray(recipe.dietarySpef);
                const ingredientsArr = Array.isArray(recipe.ingredients) ? recipe.ingredients : objKeysToArray(recipe.ingredients);
                const instructionsArr = Array.isArray(recipe.instructions) ? recipe.instructions : objKeysToArray(recipe.instructions);

                // Set the recipe title and details in html
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

  document.getElementById("deleteRecipeBtn").addEventListener("click", () => {
    const user = auth.currentUser;
    // Check if user is signed in
    if (!user) {
    alert("You must be signed in to delete a recipe!");
    return; // stop execution if no user is signed in
    } 

    if (!recipeId) {
        alert("No recipe ID provided.");
        return;
    }


    const recipeRef = ref(database, "recipes/" + recipeId);

    // Check if current user is the author of the recipe
    get(recipeRef).then(snapshot => {
    if (!snapshot.exists()) {
      alert("Recipe not found.");
      return;
    }

    const recipeData = snapshot.val();
    if (recipeData.author && recipeData.author !== user.uid) {
      alert("You can only delete your own recipes!");
      return;
    }
    // If the user is the author, delete the recipe
    remove(recipeRef).then(() => {
        alert("Recipe deleted successfully!");
        window.location.href = "recipeList.html"; 
    }).catch(error => {
        alert("Error deleting recipe: " + error.message);
    });

  });
  });
}


// ==== MEAL PLAN PAGE LOGIC ====
if (pageType === "mealplan") {
  
let mealPlan = {};
const mealPlansRef = ref(database, "mealPlans");
const container = document.getElementById("mealPlansList");


// Pull any saved mealplans onto the page
get(mealPlansRef)
.then(snapshot => {
  if (!snapshot.exists()) {
    container.textContent = "No meal plans saved.";
    return;
  }

  // Loop through each user's meal plans
  const usersPlans = snapshot.val();
  for (const [uid, userPlans] of Object.entries(usersPlans)) { // uid is the user ID
    for (const [date, planData] of Object.entries(userPlans)) { // date is the meal plan date
      const div = document.createElement("div");
      div.innerHTML = `
        <a href="mealPlan.html?id=${date}&uid=${uid}" target="_blank">
          Meal Plan for: ${planData.date || "Unknown date"}
        </a>
      `;
      container.appendChild(div);
    }
  }
})


// Pull all recipes from the database to use in meal planning
get(ref(database, "recipes")).then(snapshot => {
  if (snapshot.exists()) {
    allRecipesList = Object.entries(snapshot.val());
    setupMP();
  } else {
    document.getElementById("recipeList").innerHTML = "No recipes found!";
  }
})


document.getElementById("mealPlanBtn").addEventListener("click", () => {
  document.getElementById("mealPlanDropD").classList.toggle("show");
});


// Set up the meal plan date input
document.getElementById("dateMealPlan").addEventListener("change", e => {
  const date = new Date(e.target.value);
  const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });

  const dayDiv = document.querySelector(".day");
  dayDiv.dataset.day = dayName; 
  document.getElementById("dayName").textContent = dayName;
      updateMP();
});


// Set up the meal plan slots
function setupMP() {
  document.querySelectorAll(".addRecipeBtn")
  .forEach(button => {
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

// Show recipe choices for a specific meal
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

  // Create clickable recipe choices
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

// Add a recipe to the meal plan for a specific day and meal
function addToMP(day, meal, recipeId) {
  mealPlan[day] ??= {};
  mealPlan[day][meal] = recipeId;
}

// Update the meal plan display with selected recipes
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

// Save the meal plan to database
document.getElementById("saveMealPlan").addEventListener("click", () => {
  const date = document.getElementById("dateMealPlan").value;
  if (!date) {
    alert("Please enter a date for your meal plan.");
    return;
  }

  const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'long' }); // get the day name from the date
  const dayMeals = mealPlan[dayName] || {}; 
  const hasMeals = ["Breakfast", "Lunch", "Dinner"].some(meal => dayMeals[meal]); // check if at least one meal is set

  if (!hasMeals) {
    alert("You must add at least one recipe before saving!");
    return;
  }

  // Make a meal plan object to save
  const mealPlanSave = {
    date, // save the date set
    dayName,     
    author: auth.currentUser ? auth.currentUser.uid : null, // save the user ID if signed in
    mplan: dayMeals
  };

  const userId = auth.currentUser.uid;
  const userMealPlansRef = ref(database, `mealPlans/${userId}`);

  // Push a new meal plan to the user's meal plans with a unique ID under "mealPlans"
  const newPlanRef = push(userMealPlansRef);
  set(newPlanRef, mealPlanSave)
    .then(() => {
      alert("Saved meal plan!");
    })
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
  const userId = params.get("uid");

  const mplanTitle = document.getElementById("mplanTitle");
  const mplanDetails = document.getElementById("mplanDetails");

  if (!mplanId) {
    mplanTitle.textContent = "No meal plan ID given.";
    mplanDetails.innerHTML = "";
  }

  // Pull all recipes from the database to use in meal planning
  get(recipesRef)
  .then(recipeSnapshot => {
    if (!recipeSnapshot.exists()) {
      mplanTitle.textContent = "No recipes found in database.";
      mplanDetails.innerHTML = "";
    }
    const allRecipesList = Object.entries(recipeSnapshot.val()); // convert to array of [id, recipe] pairs

    // Pull the meal plan from the database by its unique ID
    const mplanRef = ref(database, `mealPlans/${userId}/${mplanId}`);
    return get(mplanRef).then(snapshot => {
      if (!snapshot.exists()) {
        mplanTitle.textContent = "Sorry, that meal plan could not be found.";
        mplanDetails.innerHTML = "";
        return;
      }
      const data = snapshot.val();
      mplanTitle.textContent = `Meal Plan for: ${data?.date || "Unknown Date"}`;



      const mealPlanObj = data.mplan || {};
      const meals = mealPlanObj; // mplan for that day only

      // Display the meal plan details in html
      const html = `
        <h3>${data.dayName}</h3>
        <ul>
          ${["Breakfast", "Lunch", "Dinner"]
            .map(mealName => {
            const recipeId = meals[mealName];
            if (!recipeId) return ""; 
            const recipe = allRecipesList
            .find(([rid]) => rid === recipeId)?.[1];
            const title = recipe ? recipe.title : "Recipe not found";
            return `<li><strong>${mealName}:</strong> 
                      <a href="recipe.html?uid=${data.author}&id=${recipeId}" target="_blank">${title}</a>
                    </li>`;
          }).join("")}
        </ul>
        <button class="deleteMPBtn">Delete meal plan</button>
      `;
      mplanDetails.innerHTML = html;
      
  document.querySelector(".deleteMPBtn").addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) {
    alert("You must be signed in to delete a meal plan!");
    return; // stop execution if no user is signed in
    } 

    if (!mplanId) {
        alert("No meal plan ID provided.");
        return;
    }

    // Check if current user is the author of the meal plan
    get(mplanRef)
    .then(snapshot => {
    if (!snapshot.exists()) {
      alert("meal plan not found.");
      return;
    }
    const mpData = snapshot.val();
    if (mpData.author && mpData.author !== user.uid) {
      alert("You can only delete your own meal plans!");
      return;
    }

    // If the user is the author, delete the meal plan
    remove(mplanRef)
    .then(() => {
        alert("Recipe deleted successfully!");
        window.location.href = "mealPlans.html"; 
    }).catch(error => {
        alert("Error deleting recipe: " + error.message);
    });

  })
  })

  })
  })
}


// ==== GROCERIES PAGE LOGIC ====
if (pageType === "groceries") {
  const mealPlanSelect = document.getElementById("mealPlanSelect");
  const ingredientsList = document.getElementById("ingredientsList");

  // Pull all meal plans from the database
  get(ref(database, "mealPlans"))
    .then(snap => {
      if (!snap.exists()) return;

      const allPlans = snap.val();
      const plansByDate = {}; // map date -> {userId, planId}

      // Loop through all meal plans and populate the select dropdown
      Object.entries(allPlans)
      .forEach(([userId, userPlans]) => {
        Object.entries(userPlans)
        .forEach(([planId, planData]) => {
          if (planData.date) {
            plansByDate[planData.date] = { userId, planId };
            mealPlanSelect.innerHTML += `<option value="${planData.date}">${planData.date}</option>`;
          }
        })
      })
    
      // Sort the options by date
      mealPlanSelect.addEventListener("change", () => {
        const selectedDate = mealPlanSelect.value;
        if (!selectedDate) return;

        const planInfo = plansByDate[selectedDate];
        if (!planInfo) {
          ingredientsList.innerHTML = "<li>No meal plan found for this date.</li>";
          return;
        }

        const { userId, planId } = planInfo;

        // Get the meal plan for picked date
        get(ref(database, `mealPlans/${userId}/${planId}`))
        .then(planSnap => {
          if (!planSnap.exists()) {
            ingredientsList.innerHTML = "<li>No data found for that meal plan.</li>";
            return;
          }

          const mealPlanData = planSnap.val().mplan || {};
          const recipeIds = Object.values(mealPlanData).filter(Boolean); // just get all recipe IDs

          if (recipeIds.length === 0) {
            ingredientsList.innerHTML = "<li>No recipes in this meal plan.</li>";
            return;
          }

          // Get all recipes
          get(ref(database, "recipes")).then(recipeSnap => {
            if (!recipeSnap.exists()) {
              ingredientsList.innerHTML = "<li>No recipes found.</li>";
              return;
            }

            const recipes = recipeSnap.val();
            const allIngredients = [];

            // Loop through each recipe ID and collect ingredients
            recipeIds.forEach(rid => {
              const recipe = recipes[rid];
              if (recipe && Array.isArray(recipe.ingredients)) {
                allIngredients.push(...recipe.ingredients);
              }
            });

            // Remove duplicates ingredients and display the ingredients
            const uniqueIngredients = [...new Set(allIngredients)];
            ingredientsList.innerHTML = uniqueIngredients.length
              ? uniqueIngredients.map(i => `<li>${i}</li>`).join("")
              : "<li>No ingredients found.</li>";
          });
        });
      });
    })
    .catch(error => {
      console.error(error);
      ingredientsList.innerHTML = "<li>Error loading ingredients.</li>";
    });
}
