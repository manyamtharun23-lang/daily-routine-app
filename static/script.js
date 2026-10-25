const calories = { Egg: 70, Rice: 200, Banana: 105, Almonds: 70, Milk: 120 };
const WATER_GOAL = 8;

const dayPicker = document.getElementById("day-picker");
const statusText = document.getElementById("status");
const streakText = document.getElementById("streak-text");

const chkWorkout = document.getElementById("chk-workout");
const chkDiet = document.getElementById("chk-diet");
const chkWater = document.getElementById("chk-water");

const waterCount = document.getElementById("water-count");
const waterPlus = document.getElementById("water-plus");
const waterMinus = document.getElementById("water-minus");

const timeInput = document.getElementById("workout-time");
const saveTimeBtn = document.getElementById("save-time");
const message = document.getElementById("message");
const alarmBtn = document.getElementById("alarm-btn");
const alarmStatus = document.getElementById("alarm-status");

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
let state = emptyState();
let ready = false;
let alarmOn = false;
let lastAlarmKey = "";

function emptyState() {
  return {
    exercises: [],
    foods: [],
    water: 0,
    workout_done: false,
    diet_done: false,
    water_done: false
  };
}

function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function unauthorized(res) {
  if (res.status === 401) {
    window.location.href = "/login";
    return true;
  }
  return false;
}

function loadStreak() {
  return fetch("/api/streak")
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (data) {
        streakText.textContent = "🔥 Streak: " + data.streak + " day(s)";
      }
    });
}

function saveDay() {
  if (!ready) {
    return Promise.resolve();
  }
  return fetch("/api/day/" + dayPicker.value, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state)
  })
    .then(function (res) {
      if (unauthorized(res)) {
        return;
      }
      if (!res.ok) {
        throw new Error("save failed");
      }
      statusText.textContent = "";
      return loadStreak();
    })
    .catch(function () {
      statusText.textContent = "Could not save. Please try again.";
    });
}

function showExercises() {
  exerciseList.innerHTML = "";
  state.exercises.forEach(function (item, index) {
    const li = document.createElement("li");
    li.textContent = item.name + " - " + item.minutes + " min ";
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "delete-btn";
    del.addEventListener("click", function () {
      state.exercises.splice(index, 1);
      saveDay();
      showExercises();
    });
    li.appendChild(del);
    exerciseList.appendChild(li);
  });
}

function showFoods() {
  foodList.innerHTML = "";
  let total = 0;
  state.foods.forEach(function (item, index) {
    const cal = (calories[item.name] || 0) * item.qty;
    total += cal;
    const li = document.createElement("li");
    li.textContent = item.name + " x " + item.qty + " = " + cal + " kcal ";
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "delete-btn";
    del.addEventListener("click", function () {
      state.foods.splice(index, 1);
      saveDay();
      showFoods();
    });
    li.appendChild(del);
    foodList.appendChild(li);
  });
  totalCalories.textContent = "Total: " + total + " kcal (approx)";
}

function showWater() {
  waterCount.textContent = state.water + " / " + WATER_GOAL;
}

function showChecks() {
  chkWorkout.checked = state.workout_done;
  chkDiet.checked = state.diet_done;
  chkWater.checked = state.water_done;
}

function render() {
  showExercises();
  showFoods();
  showWater();
  showChecks();
}

function loadDay() {
  ready = false;
  return fetch("/api/day/" + dayPicker.value)
    .then(function (res) {
      if (unauthorized(res)) {
        return null;
      }
      return res.json();
    })
    .then(function (data) {
      if (!data) {
        return;
      }
      state = {
        exercises: data.exercises || [],
        foods: data.foods || [],
        water: data.water || 0,
        workout_done: !!data.workout_done,
        diet_done: !!data.diet_done,
        water_done: !!data.water_done
      };
      ready = true;
      render();
    });
}

function loadWorkoutTime() {
  fetch("/api/data")
    .then(function (res) {
      if (unauthorized(res)) {
        return null;
      }
      return res.json();
    })
    .then(function (data) {
      if (!data) {
        return;
      }
      workoutTime = data.workout_time || "";
      timeInput.value = workoutTime;
      if (workoutTime) {
        message.textContent = "Saved workout time: " + workoutTime;
      }
    });
}

function checkAlarm() {
  if (!alarmOn || !workoutTime) {
    return;
  }
  const now = new Date();
  const current =
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");
  const key = todayString() + " " + current;
  if (current === workoutTime && key !== lastAlarmKey) {
    lastAlarmKey = key;
    try {
      new Notification("Workout time!", { body: "Time for your workout." });
    } catch (e) {
      alarmStatus.textContent = "Workout time! (Notification not supported here.)";
    }
  }
}

dayPicker.addEventListener("change", function () {
  if (dayPicker.value === "") {
    dayPicker.value = todayString();
  }
  loadDay();
});

chkWorkout.addEventListener("change", function () {
  state.workout_done = chkWorkout.checked;
  saveDay();
});
chkDiet.addEventListener("change", function () {
  state.diet_done = chkDiet.checked;
  saveDay();
});
chkWater.addEventListener("change", function () {
  state.water_done = chkWater.checked;
  saveDay();
});

waterPlus.addEventListener("click", function () {
  if (state.water < 50) {
    state.water += 1;
    showWater();
    saveDay();
  }
});
waterMinus.addEventListener("click", function () {
  if (state.water > 0) {
    state.water -= 1;
    showWater();
    saveDay();
  }
});

saveTimeBtn.addEventListener("click", function () {
  if (timeInput.value === "") {
    message.textContent = "Please select a time first.";
    return;
  }
  workoutTime = timeInput.value;
  fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workout_time: workoutTime, exercises: [], foods: [] })
  })
    .then(function (res) {
      if (unauthorized(res)) {
        return;
      }
      if (!res.ok) {
        throw new Error("save failed");
      }
      message.textContent = "Saved workout time: " + workoutTime;
    })
    .catch(function () {
      message.textContent = "Could not save the time. Please try again.";
    });
});

alarmBtn.addEventListener("click", function () {
  if (!("Notification" in window)) {
    alarmStatus.textContent = "This browser does not support notifications.";
    return;
  }
  Notification.requestPermission().then(function (permission) {
    if (permission === "granted") {
      alarmOn = true;
      alarmStatus.textContent = "Alarm is ON. Keep this page open.";
    } else {
      alarmStatus.textContent = "Notification permission was denied.";
    }
  });
});

addExerciseBtn.addEventListener("click", function () {
  const minutes = Number(exerciseMin.value);
  if (minutes < 1) {
    return;
  }
  state.exercises.push({ name: exerciseSelect.value, minutes: minutes });
  saveDay();
  showExercises();
});

addFoodBtn.addEventListener("click", function () {
  const qty = Number(foodQty.value);
  if (qty < 1) {
    return;
  }
  state.foods.push({ name: foodSelect.value, qty: qty });
  saveDay();
  showFoods();
});

dayPicker.value = todayString();
loadDay();
loadStreak();
loadWorkoutTime();
setInterval(checkAlarm, 15000);
