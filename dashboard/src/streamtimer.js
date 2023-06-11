const timerRep = nodecg.Replicant('cs-timer');

const localTime = document.querySelector('#localtime');
const timer = document.querySelector('#timer');
const startStopButton = document.querySelector('#startstop');
const resetButton = document.querySelector('#reset');
const resetConfirmButton = document.querySelector('#reset-confirm');

updateLocalTime();
setInterval(updateLocalTime, 5000);

if (window.location.href.includes("standalone=true")) {
    document.head.innerHTML += `<link rel="stylesheet" href="standalone-style.css">`
}

NodeCG.waitForReplicants(timerRep).then(() => {

    timerRep.on('change', (newVal) => {
        timer.innerHTML = formatTime(newVal.startTime, newVal.currentTime);

        if (newVal.active) {
            startStopButton.innerHTML = "Stop";
            timer.style.filter = "none";
        } else {
            startStopButton.innerHTML = "Start";
            timer.style.filter = "brightness(0.75)";
            timer.innerHTML += `<span class="paused">paused</span>`;
        }
    });

});

function formatTime(startTime, currentTime){
    let time = (currentTime - startTime);
    let hours = Math.floor(time / 3600);
    time = time - (hours * 3600);
    let minutes = Math.floor(time / 60);    
    let seconds = time - (minutes * 60);
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (hours > 0) {
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        return `${hours}:${minutes}:${seconds}`;
    } else {
        return `${minutes}:${seconds}`;
    }
}

function startStopButtonClicked(){
    timerRep.value.active = !timerRep.value.active;
}

function resetButtonClicked(){
    resetButton.style.display = "none";
    resetConfirmButton.style.display = "inline";
    setTimeout(() => {
        resetButton.style.display = "inline";
        resetConfirmButton.style.display = "none";
    }, 4000);
}

function resetConfirmButtonClicked(){
    const time = Math.floor(Date.now() / 1000);
    timerRep.value.startTime = time
    timerRep.value.currentTime = time;
    resetButton.style.display = "inline";
    resetConfirmButton.style.display = "none";
}

function updateLocalTime(){
    const date = new Date();
    const str = `Local Time: ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/Chicago'})} CDT`;
    localTime.innerHTML = str;  
}