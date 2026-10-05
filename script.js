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

async function sendQuestion() {
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

  response.textContent = "Connecting to your AI Tutor...";

  try {
    const result = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subject: selectedSubject,
        question: question
      })
    });

    const data = await result.json();

    response.textContent = data.answer;

  } catch (error) {
    response.textContent =
      "The AI Tutor backend is not connected yet.";
  }
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
  document.getElementById("response").textContent =
    "Photo received. Image understanding will be connected to the AI backend next.";
}
