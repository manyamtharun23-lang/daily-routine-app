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

// ---------- Food plan ----------
const foodSelect = document.getElementById("food-select");
const foodQty = document.getElementById("food-qty");
const addFoodBtn = document.getElementById("add-food");
const foodList = document.getElementById("food-list");

let foods = JSON.parse(localStorage.getItem("foods")) || [];

function showFoods() {
  foodList.innerHTML = "";
  foods.forEach(function (item) {
    const li = document.createElement("li");
    li.textContent = item.name + " x " + item.qty;
    foodList.appendChild(li);
  });
}

addFoodBtn.addEventListener("click", function () {
  const qty = Number(foodQty.value);
  if (qty < 1) {
    return;
  }
  foods.push({ name: foodSelect.value, qty: qty });
  localStorage.setItem("foods", JSON.stringify(foods));
  showFoods();
});

showFoods();
