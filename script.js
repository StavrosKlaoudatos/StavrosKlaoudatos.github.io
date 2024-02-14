// Initialize or update display from localStorage
function initialize() {
  // Initial setup or validation for localStorage values
  if (!localStorage.getItem("dailyBalance")) {
    localStorage.setItem("dailyBalance", "30");
  }
  if (!localStorage.getItem("totalBalance")) {
    localStorage.setItem("totalBalance", "3163");
  }
  if (!localStorage.getItem("currentBalance")) {
    localStorage.setItem("currentBalance", "0");
  }
  if (!localStorage.getItem("resetIntervalHours")) {
    localStorage.setItem("resetIntervalHours", "24"); // Default reset interval set to 24 hours
  }
  if (!localStorage.getItem("lastResetTimestamp")) {
    localStorage.setItem("lastResetTimestamp", new Date().getTime().toString()); // Initialize last reset timestamp
  }

  updateDisplay();
  setInterval(checkDailyReset, 60000); // Check every minute for reset
}

// Update values on the page
function updateDisplay() {
  if (document.getElementById("dailyMoney")) {
    document.getElementById("dailyMoney").textContent = `$${localStorage.getItem("dailyBalance")}`;
  }
  if (document.getElementById("totalBalance")) {
    document.getElementById("totalBalance").textContent = `$${localStorage.getItem("totalBalance")}`;
  }
  if (document.getElementById("currentBalance")) {
    document.getElementById("currentBalance").textContent = `$${localStorage.getItem("currentBalance")}`;
  }
}

// Add transaction
function addTransaction() {
  const transactionAmount = parseFloat(document.getElementById("transactionAmount").value);
  let dailyBalance = parseFloat(localStorage.getItem("dailyBalance")) - transactionAmount;
  let totalBalance = parseFloat(localStorage.getItem("totalBalance")) - transactionAmount;
  localStorage.setItem("dailyBalance", dailyBalance.toString());
  localStorage.setItem("totalBalance", totalBalance.toString());
  updateDisplay();
}

// Update values from the control page
function updateValues() {
  const newDailyLimit = parseFloat(document.getElementById("newDailyLimit").value);
  const newTotalBalance = parseFloat(document.getElementById("newTotalBalance").value);
  const newCurrentBalance = parseFloat(document.getElementById("newCurrentBalance").value); // Read new current balance
  localStorage.setItem("dailyBalance", newDailyLimit.toString());
  localStorage.setItem("totalBalance", newTotalBalance.toString());
  localStorage.setItem("currentBalance", newCurrentBalance.toString()); // Update current balance
  alert("Values updated successfully!");
}

function checkDailyReset() {
  const now = new Date().getTime();
  const lastResetTimestamp = parseInt(localStorage.getItem("lastResetTimestamp"));
  const resetInterval = parseInt(localStorage.getItem("resetIntervalHours")) * 3600000; // Convert hours to milliseconds

  if (now - lastResetTimestamp >= resetInterval) {
    let currentBalance = parseFloat(localStorage.getItem("currentBalance"));
    let dailyBalance = parseFloat(localStorage.getItem("dailyBalance"));
    currentBalance += dailyBalance; // Add remaining daily balance to current balance
    dailyBalance = 30; // Reset daily balance to default value
    localStorage.setItem("currentBalance", currentBalance.toString());
    localStorage.setItem("dailyBalance", dailyBalance.toString());
    localStorage.setItem("lastResetTimestamp", now.toString()); // Update last reset timestamp
    updateDisplay();
  }
}

function resetTimer() {
  const resetIntervalHours = document.getElementById("resetInterval").value;
  localStorage.setItem("resetIntervalHours", resetIntervalHours);
  localStorage.setItem("lastResetTimestamp", new Date().getTime().toString()); // Reset the timer to now
  checkDailyReset(); // Perform a reset check immediately
  alert(`Timer reset! Next reset in ${resetIntervalHours} hours.`);
}

document.addEventListener('DOMContentLoaded', initialize);
