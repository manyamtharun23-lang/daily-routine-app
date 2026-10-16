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
