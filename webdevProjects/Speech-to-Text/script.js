// Get references to all the HTML elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const output = document.getElementById('output');
const status = document.getElementById('status');
const notesList = document.getElementById('notes-list');

console.log("Script loaded. Elements selected.");

// Check for browser support for the Speech Recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;

if (!SpeechRecognition) {
    status.textContent = "Sorry, your browser does not support Speech Recognition.";
    startBtn.disabled = true;
    console.error("Speech Recognition not supported in this browser.");
} else {
    console.log("Speech Recognition is supported.");

    const recognition = new SpeechRecognition();

    // Configure recognition settings
    recognition.continuous = true; // Keep listening even after a pause
    recognition.interimResults = true; // Show results as they are being recognized
    recognition.lang = 'en-US';

    let transcript = '';

    // --- Event Handlers for the Recognition API ---

    recognition.onstart = () => {
        status.textContent = "Listening...";
        console.log("Recognition started.");
    };

    recognition.onresult = (event) => {
        console.log("onresult event fired:", event);
        let interim_transcript = '';
        let final_transcript_chunk = ''; // To store final part from this event

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript_chunk += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        
        transcript += final_transcript_chunk; // Append only the final part to our main transcript
        output.value = transcript + interim_transcript; // Display final + current interim
    };

    recognition.onend = () => {
        status.textContent = 'Click "Start Listening" to begin.';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        console.log("Recognition ended.");
    };

    recognition.onerror = (event) => {
        console.error(`Recognition error: ${event.error}`);
        let errorMsg = event.error;
        if (event.error === 'no-speech') {
            errorMsg = 'No speech detected. Please speak louder or try again.';
        } else if (event.error === 'network') {
            errorMsg = 'Network error. Check your internet connection.';
        } else if (event.error === 'permission-denied') {
            errorMsg = 'Microphone permission denied. Please allow access in browser settings.';
        }
        status.textContent = `Error: ${errorMsg}`;
    };

    // --- Button Click Event Listeners ---

    startBtn.addEventListener('click', () => {
        console.log("Start button clicked.");
        startBtn.disabled = true; // Disable immediately
        stopBtn.disabled = false; // Enable stop button
        output.value = ''; // Clear the textarea
        transcript = ''; // Clear the transcript variable
        recognition.start();
    });

    stopBtn.addEventListener('click', () => {
        console.log("Stop button clicked.");
        recognition.stop();
    });

    saveNoteBtn.addEventListener('click', () => {
        const noteText = output.value.trim();
        console.log(`Save button clicked. Text to save: "${noteText}"`);
        if (noteText) {
            const li = document.createElement('li');
            li.textContent = noteText;
            notesList.appendChild(li);
            // Clearing the textarea is a user experience choice. 
            // Let's clear it and also clear the transcript variable to keep them in sync.
            output.value = '';
            transcript = '';
            console.log("Note saved and textarea cleared.");
        } else {
            console.log("Textarea was empty. Nothing to save.");
        }
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the text area and all saved notes?')) {
            output.value = '';
            transcript = '';
            notesList.innerHTML = ''; // Clear all child list items
            console.log("Text area and all notes cleared.");
        }
    });
}