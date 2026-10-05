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

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          token: token
        })
      }
    );

    const data = await result.json();

    if (!data.valid) {

      localStorage.removeItem(
        "utme_access_token"
      );

      return false;
    }

    return true;

  } catch (error) {

    return false;
  }
}


async function updateAccessStatus() {

  const status =
    document.getElementById("accessStatus");

  if (!status) {
    return;
  }

  const valid = await checkAccess();

  if (!valid) {

    status.textContent =
      "🔒 Access code required.";

    return;
  }

  const type =
    localStorage.getItem(
      "utme_access_type"
    );

  const expiry =
    localStorage.getItem(
      "utme_access_expiry"
    );

  const date =
    expiry
      ? new Date(expiry).toLocaleDateString()
      : "";

  status.textContent =
    "✅ " +
    type.toUpperCase() +
    " access active until " +
    date;
}


// =========================
// SUBJECTS
// =========================

function chooseSubject(subject) {

  selectedSubject = subject;

  document.getElementById(
    "selectedSubject"
  ).textContent =
    "Selected subject: " + subject;
}


// =========================
// LEARNING FEATURES
// =========================

function showMessage(feature) {

  document.getElementById(
    "response"
  ).textContent =
    feature +
    " will be available in the next stage.";
}


// =========================
// AI TUTOR
// =========================

async function sendQuestion() {

  const input =
    document.getElementById(
      "questionInput"
    );

  const response =
    document.getElementById(
      "response"
    );

  const question =
    input.value.trim();

  if (question === "") {

    response.textContent =
      "Please type a question first.";

    return;
  }

  if (selectedSubject === "") {

    response.textContent =
      "Please select a subject first.";

    return;
  }

  const access =
    await checkAccess();

  if (!access) {

    response.textContent =
      "🔒 Please activate a valid access code first.";

    return;
  }

  response.textContent =
    "Connecting to your AI Tutor...";

  try {

    const token =
      localStorage.getItem(
        "utme_access_token"
      );

    const result = await fetch(
      API_URL + "/ask",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          token: token,
          subject: selectedSubject,
          question: question
        })
      }
    );

    const data =
      await result.json();

    if (!result.ok) {

      response.textContent =
        data.error ||
        "Access denied.";

      return;
    }

    response.textContent =
      data.answer;

  } catch (error) {

    response.textContent =
      "The AI Tutor backend is not connected.";
  }
}


// =========================
// VOICE INPUT
// =========================

function startVoice() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    document.getElementById(
      "response"
    ).textContent =
      "Voice input is not supported by this browser.";

    return;
  }

  const recognition =
    new SpeechRecognition();

  recognition.lang =
    "en-NG";

  recognition.onresult =
    function(event) {

      document.getElementById(
        "questionInput"
      ).value =
        event.results[0][0].transcript;
    };

  recognition.start();
}


// =========================
// PHOTO INPUT
// =========================

function photoSelected() {

  document.getElementById(
    "response"
  ).textContent =
    "Photo received. Image understanding will be connected to the AI backend next.";
}


// =========================
// STARTUP
// =========================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    updateAccessStatus();

  }
);
