const URL = "./my_model/";
const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";
let model, webcam, labelContainer, maxPredictions;

let iniciado = false;
async function init() {
    if (iniciado) {
        stopCamera() ;
        iniciado = false;
    }
    document.getElementById("botao").innerHTML="Parar";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    const flip = true; 
    webcam = new tmImage.Webcam(200, 200, flip); 
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

  
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { 
        const labelDiv = document.createElement("div");
        labelDiv.className = 'labelDiv'; 
        labelContainer.appendChild(labelDiv);
    }
    iniciado = true;
}

function stopCamera() {
    location.reload();
    
}





async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className;
        const labelDiv = labelContainer.childNodes[i];
        labelDiv.innerHTML = classPrediction;

        if (!labelDiv.querySelector('.progress-container')) {
            const progressBarContainer = document.createElement("div");
            progressBarContainer.className = "progress-container";
            const progressBarGreen = document.createElement("div");
            progressBarGreen.className = "progress-bar green";
            progressBarGreen.innerText = "0%";
            progressBarContainer.appendChild(progressBarGreen);
            labelDiv.appendChild(progressBarContainer);
        }

        const percentage = (prediction[i].probability * 100).toFixed(2);
        const complementPercentage = 100 - percentage;
		if ((prediction[0].probability * 100).toFixed(2) > 70) {
					//beep();
					speak("Acordaaaa!!!");
				}

        const progressBarGreen = labelDiv.querySelector('.progress-bar.green');
        progressBarGreen.style.width = `${percentage}%`;
        progressBarGreen.textContent = `${percentage}%`;
    }
}



let isAlreadySpeaking = false;
function speak(text) {
    if (isAlreadySpeaking) return; 
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1; 
    speech.pitch = 1; 
	speech.onend = () => { isAlreadySpeaking = false; };  
    speechSynthesis.speak(speech);
    isAlreadySpeaking = true;
}



function beep(duration = 300, frequency = 440, volume = 1) {
    let oscillator = context.createOscillator();
    let gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.value = volume;
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
}
