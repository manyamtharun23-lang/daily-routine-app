const calories = { Egg: 70, Rice: 200, Banana: 105, Almonds: 70, Milk: 120 };

const timeInput = document.getElementById("workout-time");
const saveBtn = document.getElementById("save-time");
const message = document.getElementById("message");

const exerciseSelect = document.getElementById("exercise-select");
const exerciseMin = document.getElementById("exercise-min");
const addExerciseBtn = document.getElementById("add-exercise");
const exerciseList = document.getElementById("exercise-list");

const foodSelect = document.getElementById("food-select");
const foodQty = document.getElementById("food-qty");
const addFoodBtn = document.getElementById("add-food");
const foodList = document.getElementById("food-list");
const totalCalories = document.getElementById("total-calories");

let workoutTime = "";
let exercises = [];
let foods = [];

function saveToServer() {
  return fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workout_time: workoutTime,
      exercises: exercises,
      foods: foods
    })
  })
    .then(function (res) {
      if (!res.ok) {
        throw new Error("save failed");
      }
    })
    .catch(function () {
      message.textContent = "Could not save. Please login again.";
    });
}

function showTime() {
  timeInput.value = workoutTime;
  if (workoutTime) {
    message.textContent = "Saved workout time: " + workoutTime;
  }
}

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
      saveToServer();
      showExercises();
    });
    li.appendChild(del);
    exerciseList.appendChild(li);
  });
}

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
      saveToServer();
      showFoods();
    });
    li.appendChild(del);
    foodList.appendChild(li);
  });
  totalCalories.textContent = "Total: " + total + " kcal (approx)";
}

saveBtn.addEventListener("click", function () {
  if (timeInput.value === "") {
    message.textContent = "Please select a time first.";
    return;
  }
  workoutTime = timeInput.value;
  saveToServer().then(function () {
    message.textContent = "Saved workout time: " + workoutTime;
  });
});

addExerciseBtn.addEventListener("click", function () {
  const minutes = Number(exerciseMin.value);
  if (minutes < 1) {
    return;
  }
  exercises.push({ name: exerciseSelect.value, minutes: minutes });
  saveToServer();
  showExercises();
});

addFoodBtn.addEventListener("click", function () {
  const qty = Number(foodQty.value);
  if (qty < 1) {
    return;
  }
  foods.push({ name: foodSelect.value, qty: qty });
  saveToServer();
  showFoods();
});

fetch("/api/data")
  .then(function (res) {
    if (res.status === 401) {
      window.location.href = "/login";
      return null;
    }
    return res.json();
  })
  .then(function (data) {
    if (!data) {
      return;
    }
    workoutTime = data.workout_time || "";
    exercises = data.exercises || [];
    foods = data.foods || [];
    showTime();
    showExercises();
    showFoods();
  });
