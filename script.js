let selectedSubject = "";

const API_URL = "http://localhost:8000";


// =========================
// ACCESS CODE SYSTEM
// =========================

async function activateAccess() {

  const input = document.getElementById("accessCode");
  const message = document.getElementById("accessMessage");

  if (!input || !message) {
    return;
  }

  const code = input.value.trim().toUpperCase();

  if (code === "") {
    message.textContent = "Please enter your access code.";
    return;
  }

  message.textContent = "Checking access code...";

  try {

    const result = await fetch(
      API_URL + "/activate",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          code: code
        })
      }
    );

    const data = await result.json();

    if (!data.success) {

      message.textContent =
        data.message || "Access code was not accepted.";

      return;
    }

    localStorage.setItem(
      "utme_access_token",
      data.token
    );

    localStorage.setItem(
      "utme_access_type",
      data.type
    );

    localStorage.setItem(
      "utme_access_expiry",
      data.expires_at
    );

    message.textContent =
      "✅ Access activated successfully!";

    updateAccessStatus();

  } catch (error) {

    message.textContent =
      "Unable to connect to the backend.";
  }
}


// =========================
// CHECK ACCESS
// =========================

async function checkAccess() {

  const token = localStorage.getItem(
    "utme_access_token"
  );

  if (!token) {
    return false;
  }

  try {

    const result = await fetch(
      API_URL + "/check-access",
      {
        method: "POST",

       
