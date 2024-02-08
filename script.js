// Initialize or update display from localStorage
function initialize() {
    // Check if data exists in localStorage, else initialize
    if (!localStorage.getItem("dailyBalance")) {
      localStorage.setItem("dailyBalance", "30");
    }
    if (!localStorage.getItem("totalBalance")) {
      localStorage.setItem("totalBalance", "3581");
    }
    // Initialize currentBalance to 0 only if it doesn't already exist in localStorage
    if (!localStorage.getItem("currentBalance")) {
      localStorage.setItem("currentBalance", "0");
    } else {
      // Check if we need to perform a daily reset and adjust current balance accordingly
      checkDailyReset();
    }
    updateDisplay();
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
    window.location.href = "index.html"; // Redirect to home to see changes
}

  
  // Check and perform daily reset if necessary
  function checkDailyReset() {
    const lastResetTimestamp = localStorage.getItem("lastResetTimestamp");
    const now = new Date();
    if (!lastResetTimestamp || now - new Date(parseInt(lastResetTimestamp)) >= 86400000) { // 24 hours
      let currentBalance = parseFloat(localStorage.getItem("currentBalance"));
      let dailyBalance = parseFloat(localStorage.getItem("dailyBalance"));
      currentBalance += dailyBalance; // Add remaining daily balance to current balance
      localStorage.setItem("currentBalance", currentBalance.toString());
      localStorage.setItem("dailyBalance", "30"); // Reset daily balance
      localStorage.setItem("lastResetTimestamp", now.getTime().toString()); // Update last reset timestamp
    }
  }
  
  document.addEventListener('DOMContentLoaded', initialize);
  