// ---------- Helpers ----------
function load(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Workout time ----------
const timeInput = document.getElementById("workout-time");
const saveBtn = document.getElementById("save-time");
const message = document.getElementById("message");

const savedTime = localStorage.getItem("workoutTime");
if (savedTime) {
  timeInput.value = savedTime;
  message.textContent = "Saved workout time: " + savedTime;
}

saveBtn.addEventListener("click", function () {
  if (timeInput.value === "") {
    message.textContent = "Please select a time first.";
    return;
  }
  localStorage.setItem("workoutTime", timeInput.value);
  message.textContent = "Saved workout time: " + timeInput.value;
});

// ---------- Workout plan ----------
const exerciseSelect = document.getElementById("exercise-select");
const exerciseMin = document.getElementById("exercise-min");
const addExerciseBtn = document.getElementById("add-exercise");
const exerciseList = document.getElementById("exercise-list");

let exercises = load("exercises");

function showExercises() {
  exerciseList.innerHTML = "";
  exercises.forEach(function (item, index) {
    const li = document.createElement("li");
    li.textContent = item.name + " - " + item.minutes + " min ";
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "delete-btn";
    del.addEventListener("click", function () {
      exercises.splice(index, 1);
      save("exercises", exercises);
      showExercises();
    });
    li.appendChild(del);
    exerciseList.appendChild(li);
  });
}

addExerciseBtn.addEventListener("click", function () {
  const minutes = Number(exerciseMin.value);
  if (minutes < 1) {
    return;
  }
  exercises.push({ name: exerciseSelect.value, minutes: minutes });
  save("exercises", exercises);
  showExercises();
});

// ---------- Food plan ----------
const calories = { Egg: 70, Rice: 200, Banana: 105, Almonds: 70, Milk: 120 };

const foodSelect = document.getElementById("food-select");
const foodQty = document.getElementById("food-qty");
const addFoodBtn = document.getElementById("add-food");
const foodList = document.getElementById("food-list");
const totalCalories = document.getElementById("total-calories");

let foods = load("foods");

function showFoods() {
  foodList.innerHTML = "";
  let total = 0;
  foods.forEach(function (item, index) {
    const cal = (calories[item.name] || 0) * item.qty;
    total += cal;
    const li = document.createElement("li");
    li.textContent = item.name + " x " + item.qty + " = " + cal + " kcal ";
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "delete-btn";
    del.addEventListener("click", function () {
      foods.splice(index, 1);
      save("foods", foods);
      showFoods();
    });
    li.appendChild(del);
    foodList.appendChild(li);
  });
  totalCalories.textContent = "Total: " + total + " kcal (approx)";
}

addFoodBtn.addEventListener("click", function () {
  const qty = Number(foodQty.value);
  if (qty < 1) {
    return;
  }
  foods.push({ name: foodSelect.value, qty: qty });
  save("foods", foods);
  showFoods();
});

showExercises();
showFoods();
