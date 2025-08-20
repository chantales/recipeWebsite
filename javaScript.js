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

function objKeysToArray(obj) {
  return obj ? Object.keys(obj) : [];
}


console.log("wanf!")

// ==== AUTHRORIZATION PAGE LOGIC ====
if (pageType === "auth") {
  const userEmail = document.getElementById("userEmail");
  const userPassword = document.getElementById("userPassword");

  const signUpBtn = document.getElementById("signUpBtn");
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  


  // to check if the user is logged in or not so show certain things / allow actions in the website
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

  // Sign up the user
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

  // Sign in the user
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

  // Sign out the user
   const userSignOut = async() => {
    await signOut(auth);
  }

  // buttons for each action 
   signUpBtn.addEventListener("click", userSignUp);
   signInBtn.addEventListener("click", userSignIn);
   signOutBtn.addEventListener("click", userSignOut);
}






// ==== INDEX PAGE LOGIC====
if (pageType === "index") {


}




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
      const isSelected = tags.includes(tag);

    if (isSelected) {
      tags = tags.filter(t => t !== tag);
      btn.classList.remove("selected");
    } else {
      if (tags.length < 3) { // only allows up to 3 tags per recipe
        tags.push(tag);
        btn.classList.add("selected");
      } else {
        alert("You can only select up to 3 tags.");
      }
    }
      console.log("tags:", tags);
    });
  });

  dietAddBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      const diet = btn.dataset.tag;
      const isSelected = dietarySpef.includes(diet);

    if (isSelected) {
      dietarySpef = dietarySpef.filter(d => d !== diet);
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
        if (dietarySpef.length >= 3) {
          alert("You can only select up to 3 dietary specifications.");
          return;
        }
        dietarySpef.push(diet);
        btn.classList.add("selected");
      }
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

  const title = document.getElementById("titleOfRecipe").value.trim();
  const prepTime = Number(document.getElementById("prepTimeOfRecipe").value.trim());
  const cookingTime = Number(document.getElementById("cookingTimeOfRecipe").value.trim());
  const ingredientsString = document.getElementById("ingredientsOfRecipe").value.trim();

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


    // section for not alloweds

    function hasNumbers(str) {
      return /\d/.test(str);
    }
    
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


    const recipe = { 
      title, 
      tags: arrayToObj(tags), 
      dietarySpef: arrayToObj(dietarySpef), 
      prepTime, 
      cookingTime, 
      ingredients, 
      instructions,
      author: user.uid };

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

  document.getElementById("deleteRecipeBtn").addEventListener("click", () => {
    const user = auth.currentUser;
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


// Pull any saved mealplans onto the page for the user to be enamoured by my cool code
get(mealPlansRef).then(snapshot => {
  if (!snapshot.exists()) {
    container.textContent = "No meal plans saved.";
    return;
  }

  const usersPlans = snapshot.val();
  for (const [uid, userPlans] of Object.entries(usersPlans)) {
    for (const [date, planData] of Object.entries(userPlans)) {
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



// Pull all recipes first
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
  const date = document.getElementById("dateMealPlan").value;
  if (!date) {
    alert("Please enter a date for your meal plan.");
    return;
  }
  const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'long' });

  const mealPlanSave = {
    date, // save the date set
    dayName,     
    mplan: mealPlan, // the meal plan object
    author: auth.currentUser ? auth.currentUser.uid : null // save the user ID if signed in
  };

  const userId = auth.currentUser.uid;
  const mealPlanRef = ref(database, `mealPlans/${userId}/${date}`);
  get(mealPlanRef)
  .then(snapshot => {
    if (snapshot.exists()) {
      alert("A meal plan for this date already exists!");
      return;
  }
  set(mealPlanRef, mealPlanSave)
  .then(() => alert("Saved meal plan!"))
  .catch(error => {
    if (error.code === 'PERMISSION_DENIED') {
      alert("Save failed: Date must be between 2025 and 2026.");
    } else {
      alert("Save failed: " + error.message);
    }
  });

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


  get(recipesRef)
  .then(recipeSnapshot => {
    if (!recipeSnapshot.exists()) {
      mplanTitle.textContent = "No recipes found in database.";
      mplanDetails.innerHTML = "";
    }
    const allRecipesList = Object.entries(recipeSnapshot.val());


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


      const mealOrder = ["Breakfast", "Lunch", "Dinner"];

      const html = Object.entries(mealPlanObj).map(([day, meals]) => {
        return `
          <h3>${day}</h3>
          <ul>
            ${mealOrder.map(mealName => {
              if (!meals[mealName]) return ""; // skip if meal not planned
              const recipeId = meals[mealName];
              const recipe = allRecipesList.find(([rid]) => rid === recipeId)?.[1];
              const title = recipe ? recipe.title : "Recipe not found";
              return `<li><strong>${mealName}:</strong> 
                      <a href="recipe.html?uid=${data.author}&id=${data.date}" target="_blank">${title}</a>
                      </li>`;
            }).join("")}
          </ul>
          <button class="deleteMPBtn" data-day="${day}">Delete meal plan</button>
        `;
      }).join("");
      
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

    remove(mplanRef)
    .then(() => {
        alert("Recipe deleted successfully!");
        window.location.href = "mealPlans.html"; 
    }).catch(error => {
        alert("Error deleting recipe: " + error.message);
    });

  });
  });



    });
   })
}








// ==== GROCERIES PAGE LOGIC ====
if (pageType == "groceries") {
  const mealPlanSelect = document.getElementById("mealPlanSelect");
  const ingredientsList = document.getElementById("ingredientsList");

  get(ref(database, "mealPlans"))
  .then(snap => {
    if (!snap.exists()) return;

    Object.entries(snap.val())
    .forEach(([dateKey]) => {
      mealPlanSelect.innerHTML += `<option value="${dateKey}">${dateKey}</option>`;
    });
  });


  mealPlanSelect.addEventListener("change", () => {
    const selectedDate = mealPlanSelect.value;
    if (!selectedDate) return;

    get(ref(database, `mealPlans/${selectedDate}`))
    .then(planSnap => {
      if (!planSnap.exists()) {
        ingredientsList.innerHTML = "<li>No data found for that meal plan.</li>";
        return;
      }
      
      const mealPlanData = planSnap.val().mplan || {};

      // Get all recipe IDs from the plan
      const recipeIds = [];
      Object.values(mealPlanData).forEach(meals => {
        Object.values(meals).forEach(recipeId => {
          recipeIds.push(recipeId);
        });
      });

      // Fetch all recipes, then filter down to the ones in the plan
      return get(ref(database, "recipes"))
      .then(recipeSnap => {
        if (!recipeSnap.exists()) {
          ingredientsList.innerHTML = "<li>No recipes found.</li>";
          return;
        }
        const recipes = recipeSnap.val();
        const allIngredients = [];

        recipeIds.forEach(rid => {
          const recipe = recipes[rid];
          if (recipe && Array.isArray(recipe.ingredients)) {
            allIngredients.push(...recipe.ingredients);
          }
        });


        const uniqueIngredients = [...new Set(allIngredients)];
        if (uniqueIngredients.length > 0) {
          ingredientsList.innerHTML = uniqueIngredients
            .map(ing => `<li>${ing}</li>`)
            .join("");
        } else {
          ingredientsList.innerHTML = "<li>No ingredients found.</li>";
        }

        });
    })
    .catch(error => {
      console.error(error);
      ingredientsList.innerHTML = "<li>Error loading ingredients.</li>";
    });
  });

}