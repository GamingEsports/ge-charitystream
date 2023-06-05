const scheduleRep = nodecg.Replicant('cs-schedule', {defaultValue: []});
const unsavedScheduleRep = nodecg.Replicant('cs-unsavedSchedule', {defaultValue: []});

const notSaved = document.querySelector(`#notsaved`);
const noSchedule = document.querySelector("#noschedule");
const nowPlaying = document.querySelector("#nowplaying");
const wrapper = document.querySelector("#wrapper");

NodeCG.waitForReplicants(scheduleRep, unsavedScheduleRep).then(() => {
    console.log("schedule", scheduleRep.value, unsavedScheduleRep.value, !replicantsEqual(unsavedScheduleRep.value, scheduleRep.value));    

    if (!replicantsEqual(unsavedScheduleRep.value, scheduleRep.value)) {
        notSaved.style.display = "block";
    } else {
        notSaved.style.display = "none";
    }

    scheduleRep.on('change', () => {
        notSaved.style.display = "none";
    });

    unsavedScheduleRep.on('change', (newVal) => {
        drawElements();

        if (wrapper.children.length == 0) {
            noSchedule.style.display = "block";
            if (nowPlaying.children.length >= 1) {
                noSchedule.innerHTML = "No future schedule items"; 
            } else {
                noSchedule.innerHTML = "No schedule items";
            }
            wrapper.style.display = "none"; 
        } else {
            noSchedule.style.display = "none";
            wrapper.style.display = "block";
        }

        if (!replicantsEqual(newVal, scheduleRep.value)) {
            notSaved.style.display = "block";
        } else {
            notSaved.style.display = "none";
        }

        if (wrapper.scrollHeight >= 450){
            wrapper.classList.add("wrapper");
        } else {
            wrapper.classList.remove("wrapper");
        }
    });
});

function drawElements(){
    wrapper.innerHTML = "";
    nowPlaying.innerHTML = "";
    if (unsavedScheduleRep.value.length == 0) {
        return;
    }
    nowPlaying.appendChild(getScheduleItemElement(unsavedScheduleRep.value[0], 0));
    for (let i = 1; i < unsavedScheduleRep.value.length; i++) {
        wrapper.appendChild(getScheduleItemElement(unsavedScheduleRep.value[i], i));
    }
}

function getScheduleItemElement(obj, index){
    const section = document.createElement("div");
    section.classList.add("section");
    section.id = `schedule${index+1}section`;

    const title = document.createElement("div");
    title.classList.add("title");
    title.innerHTML = index != 0 ? `Item ${index}` : "Now Playing";
    section.appendChild(title);

    const name = document.createElement("label");
    name.for = `schedule${index+1}name`;
    name.innerHTML = "Name";
    section.appendChild(name);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `schedule${index+1}name`;
    nameInput.autocomplete = "off";
    nameInput.onchange = () => {nameChanged(index)};
    nameInput.value = obj.name;
    section.appendChild(nameInput); 

    const time = document.createElement("label");
    time.for = `schedule${index+1}time`;
    time.innerHTML = "Time";
    section.appendChild(time);

    const timeInput = document.createElement("input");
    timeInput.type = "text";
    timeInput.id = `schedule${index+1}time`;
    timeInput.autocomplete = "off";
    timeInput.onchange = () => {timeChanged(index)};
    timeInput.value = obj.time;
    section.appendChild(timeInput);

    const removeButton = document.createElement("button");
    removeButton.innerHTML = "Remove";
    removeButton.onclick = () => {removeButtonClicked(index)};
    section.appendChild(removeButton);

    if (index != 0) {
        const moveUpButton = document.createElement("button");
        moveUpButton.innerHTML = "▲";
        moveUpButton.onclick = () => {moveUp(index)};
        section.appendChild(moveUpButton);
    }

    if (index != unsavedScheduleRep.value.length-1) {
        const moveDownButton = document.createElement("button");
        moveDownButton.innerHTML = "▼"; 
        moveDownButton.onclick = () => {moveDown(index)};
        section.appendChild(moveDownButton);
    }   

    return section;
}

function addButtonClicked(){
    unsavedScheduleRep.value.push({
        name: "",
        time: ""
    });
}

function removeButtonClicked(index){
    unsavedScheduleRep.value.splice(index, 1);
}

function updateButtonClicked(){
    scheduleRep.value = JSON.parse(JSON.stringify(unsavedScheduleRep.value));
}

function revertButtonClicked(){
    unsavedScheduleRep.value = JSON.parse(JSON.stringify(scheduleRep.value));
}

function nameChanged(index){
    unsavedScheduleRep.value[index.toString()].name = document.querySelector(`#schedule${index+1}name`).value;
}

function timeChanged(index){
    unsavedScheduleRep.value[index.toString()].time = document.querySelector(`#schedule${index+1}time`).value;
}

function moveUp(index){
    if (index == 0) {
        return;
    }
    const temp = unsavedScheduleRep.value[index];
    unsavedScheduleRep.value[index] = unsavedScheduleRep.value[index-1];
    unsavedScheduleRep.value[index-1] = temp;
}

function moveDown(index){
    if (index == unsavedScheduleRep.value.length-1) {
        return; 
    }
    const temp = unsavedScheduleRep.value[index];   
    unsavedScheduleRep.value[index] = unsavedScheduleRep.value[index+1];
    unsavedScheduleRep.value[index+1] = temp;
}

function replicantsEqual(a, b){
    if (a.length != b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i].name != b[i].name){
            return false;
        }
        if (a[i].time != b[i].time){
            return false;
        }
    }
    return true;
}