let selectedSubject = "";

function chooseSubject(subject) {
  selectedSubject = subject;

  document.getElementById("selectedSubject").textContent =
    "Selected subject: " + subject;
}

function showMessage(feature) {
  document.getElementById("response").textContent =
    feature + " will be available in the next stage.";
}

function sendQuestion() {
  const input = document.getElementById("questionInput");
  const response = document.getElementById("response");

  const question = input.value.trim();

  if (question === "") {
    response.textContent = "Please type a question first.";
    return;
  }

  if (selectedSubject === "") {
    response.textContent = "Please select a subject first.";
    return;
  }

  response.textContent =
    "Subject: " + selectedSubject +
    "\n\nQuestion received: " + question +
    "\n\nThe real AI Tutor will answer this here once the AI backend is connected.";
}

function startVoice() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    document.getElementById("response").textContent =
      "Voice input is not supported by this browser.";
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-NG";

  recognition.onresult = function(event) {
    document.getElementById("questionInput").value =
      event.results[0][0].transcript;
  };

  recognition.start();
}

function photoSelected() {
  const response = document.getElementById("response");

  response.textContent =
    "Photo received. Image understanding will be connected to the AI backend next.";
}
