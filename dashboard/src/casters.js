const castersRep = nodecg.Replicant('cs-casters');
const unsavedCastRep = nodecg.Replicant('cs-unsavedCasters');

const notSaved = document.querySelector(`#notsaved`);
const noCasters = document.querySelector("#nocasters");
const sections = document.querySelectorAll('.section');
const wrapper = document.querySelector("#wrapper");

if (window.location.href.includes("standalone=true")) {
    document.head.innerHTML += `<link rel="stylesheet" href="standalone-style.css">`
}

NodeCG.waitForReplicants(castersRep, unsavedCastRep).then(() => {
    console.log("casters", castersRep.value, unsavedCastRep.value, !replicantsEqual(unsavedCastRep.value, castersRep.value));

    if (!replicantsEqual(unsavedCastRep.value, castersRep.value)) {
        notSaved.style.display = "block";
    } else {
        notSaved.style.display = "none";
    }

    castersRep.on('change', () => {
        notSaved.style.display = "none";
    });

    unsavedCastRep.on('change', (newVal) => {
        let numVisible = 0;

        for (let i = 0; i < sections.length; i++) {
            const section = document.querySelector(`#caster${i+1}section`)
            section.style.display = newVal[i].visible ? "block" : "none";

            const downButton = section.querySelector(".caster-down-button");
            if (downButton) {
                downButton.style.display = "inline-block";
            }
            
            if (newVal[i].visible) {
                numVisible++;
            } else {
                const prev = i - 1;
                const prevDownButton = document.querySelector(`#caster${prev+1}section > .caster-down-button`);
                if (prevDownButton) {
                    prevDownButton.style.display = "none";
                }
            }
            
            document.querySelector(`#caster${i+1}name`).value = newVal[i].name;
            document.querySelector(`#caster${i+1}title`).value = newVal[i].title;
        }

        const addButton = document.querySelector(`#add`);
        if (numVisible == 4){
            addButton.classList.add("inactive");
            addButton.innerHTML = "Limit 4 Casters";
        } else {
            addButton.classList.remove("inactive");
            addButton.innerHTML = "Add";
        }

        if (numVisible == 0) {
            noCasters.style.display = "block";
            wrapper.style.display = "none";
        } else {
            noCasters.style.display = "none";
            wrapper.style.display = "block";
        }

        if (!replicantsEqual(newVal, castersRep.value)) {
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


function addButtonClicked(){
    let index = 0;
    while (index < 4) {
        if (!unsavedCastRep.value[index].visible) {
            break;
        }
        index++;
    }
    if (index >= 4) {
        return;
    }
    unsavedCastRep.value[index] = {name: "", title: "", visible: true};
}

function removeButtonClicked(index){
    unsavedCastRep.value[index].visible = false;
    for (let i = index; i < 3; i++) {
        unsavedCastRep.value[i] = unsavedCastRep.value[i+1];
    }
    unsavedCastRep.value[3].visible = false;
}

function updateButtonClicked(){
    castersRep.value = JSON.parse(JSON.stringify(unsavedCastRep.value));
}

function revertButtonClicked(){
    unsavedCastRep.value = JSON.parse(JSON.stringify(castersRep.value));
}

function nameChanged(index){
    unsavedCastRep.value[index.toString()].name = document.querySelector(`#caster${index+1}name`).value;
}

function titleChanged(index){
    unsavedCastRep.value[index.toString()].title = document.querySelector(`#caster${index+1}title`).value;
}

function downButtonClicked(index){
    const temp = unsavedCastRep.value[index];
    unsavedCastRep.value[index] = unsavedCastRep.value[index+1];
    unsavedCastRep.value[index+1] = temp;
}

function upButtonClicked(index){
    const temp = unsavedCastRep.value[index];
    unsavedCastRep.value[index] = unsavedCastRep.value[index-1];
    unsavedCastRep.value[index-1] = temp;
}

function replicantsEqual(a, b){
    if (a.length != b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i].name != b[i].name){
            return false;
        }
        if (a[i].title != b[i].title){
            return false;
        }
        if (a[i].visible != b[i].visible){
            return false;
        }
    }
    return true;
}