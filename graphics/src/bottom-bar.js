const timerRep = nodecg.Replicant("cs-timer");
const scheduleRep = nodecg.Replicant("cs-schedule");
const castersRep = nodecg.Replicant("cs-casters");
const donationRep = nodecg.Replicant("cs-donations");

const contentBoxTL = gsap.timeline();
const donationTL = gsap.timeline();
const donationTotalTL = gsap.timeline();

const localTime = document.querySelector("#local-time");
const streamTime = document.querySelector("#stream-time");
const nowPlaying = document.querySelector("#now-playing");
const casters = document.querySelector("#casters");
const donationWrapper = document.querySelector("#donation-wrapper");
const donationHeader = document.querySelector("#donation-header");
const donationBody = document.querySelector("#donation-body");

window.onload = function () {
    animateContentBoxTL(02);
    initLocalTime();
};

NodeCG.waitForReplicants(timerRep, scheduleRep, castersRep, donationRep).then(() => {
    timerRep.on("change", (newVal) => {
        const str = formatTime(newVal.startTime, newVal.currentTime);
        updateTimeStreamed(str);
    });

    scheduleRep.on("change", (newVal, oldVal) => {
        if (oldVal === undefined && newVal.length > 0) {
            updateNowPlaying(newVal[0].name);
            return;
        }
        if (newVal.length == 0) {
            updateNowPlaying("");
            return;
        }
        if (oldVal[0] === undefined) {
            updateNowPlaying(newVal[0].name);
            return;
        }
        if (newVal[0].name !== oldVal[0].name) {
            updateNowPlaying(newVal[0].name);
        }
    });

    castersRep.on("change", (newVal) => {
        updateCasters(newVal);
    });

    donationRep.on("change", (newVal) => {
        updateDonationTotal(newVal);
    });

    nodecg.listenFor("new-donation", (data) => {
        sendDonation(data);
    });
});

function animateContentBoxTL(index, anim = true) {
    const segment = document.querySelector(`.segment:nth-child(${index + 1})`);
    const segmentBody = segment.querySelector(".body");
    let duration = 8;

    gsap.set(segmentBody, { x: 0 });

    contentBoxTL.fromTo(segment, { x: 80, opacity: 0 }, {
        duration: anim ? .7 : 0, x: 0, opacity: 1, display: "flex", ease: "power3.out", onComplete: () => {
            if (segmentBody && segmentBody.offsetWidth > 610) {
                const segmentBodyTL = gsap.timeline();
                const endPoint = segmentBody.offsetWidth - 610;
                const thisDuration = endPoint * .032;
                duration = thisDuration + 4;

                segmentBodyTL.fromTo(segmentBody, { x: 0 }, { duration: thisDuration, x: -endPoint, ease: "none" }, `+=2`);
            }

            let nextIndex = index;
            let nextSegment;
            const limit = document.querySelectorAll(".segment").length;
            do {
                nextIndex++;
                if (nextIndex >= limit) {
                    nextIndex = 0;
                }
                nextSegment = document.querySelector(`.segment:nth-child(${nextIndex + 1})`);
            } while (nextSegment.classList.contains("hidden"));

            if (nextIndex !== index) {
                contentBoxTL.to(segment, {
                    duration: 1.2, x: -80, display: "none", opacity: 0, ease: "power4.in", onComplete: () => {
                        animateContentBoxTL(nextIndex);
                    }
                }, `+=${duration}`);
            } else {
                setTimeout(() => {
                    animateContentBoxTL(nextIndex, false);
                }, duration * 1000);
            }
        }
    });
}

function initLocalTime() {
    localTime.innerHTML = getLocalTimeString();
    setInterval(() => {
        localTime.innerHTML = getLocalTimeString();
    }, 5000);
}

function getLocalTimeString() {
    const date = new Date();
    const str = `${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/Chicago' })}`;
    return str.toLowerCase();
}

function updateTimeStreamed(str) {
    streamTime.innerHTML = str;
}

function formatTime(startTime, currentTime) {
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

function updateNowPlaying(str) {
    if (str === "") {
        nowPlaying.parentElement.classList.add("hidden");
    } else {
        nowPlaying.parentElement.classList.remove("hidden");
    }

    const tl = gsap.timeline();
    tl.to(nowPlaying, {
        duration: .25, opacity: 0, ease: "power2.out", onComplete: () => {
            nowPlaying.innerHTML = str;
        }
    })
        .to(nowPlaying, { duration: .25, opacity: 1, ease: "power2.in" }, "+=.1");
}

function updateCasters(obj) {
    let names = [];
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].name !== "" && obj[i].visible) {
            let casterHTML = obj[i].name;
            if (obj[i].title !== "") {
                casterHTML += `<span class="caster-title">${obj[i].title}</span>`;
            }
            names.push(casterHTML);
        }
    }

    if (names.length === 0) {
        casters.parentElement.classList.add("hidden");
    } else {
        casters.parentElement.classList.remove("hidden");
    }

    const str = names.join(", ");

    const tl = gsap.timeline();
    tl.to(casters, {
        duration: .25, opacity: 0, ease: "power2.out", onComplete: () => {
            casters.innerHTML = str;
        }
    })
        .to(casters, { duration: .25, opacity: 1, ease: "power2.in" }, "+=.1");
}

function sendDonation(info) {
    let duration = 20;
    console.log("new donation", info);
    donationTL.to(donationWrapper, {
        duration: .8, "--wipe": "100%", ease: "power3.out"
        , onStart: () => {
            donationHeader.innerHTML = `From ${info.name} / $${info.amount.toFixed(2)}`;
            if (info.message != null && info.message !== "") {
                donationBody.innerHTML = info.message;
                donationHeader.parentElement.style.fontSize = "24px";
            } else {
                donationBody.innerHTML = "";
                donationHeader.parentElement.style.fontSize = "36px";
            }

            if (donationHeader.offsetWidth > 570){
                donationHeader.style.transform = `scaleX(${570 / donationHeader.offsetWidth})`;
                donationHeader.style.transformOrigin = "left";
            } else {
                donationHeader.style.transform = `scaleX(1)`;
            }

            gsap.set(donationBody, { x: 0 });

            gsap.fromTo([donationHeader.parentElement, donationBody], { x: -80 }, { x: 0, duration: .8, ease: "power3.out" });

            let endPoint = Math.max(610, donationBody.offsetWidth) - 610;
            if (donationBody && donationBody.offsetWidth > 610) {
                const segmentBodyTL = gsap.timeline();
                const thisDuration = Math.min(endPoint * .032, 30);
                const playTwice = thisDuration <= 15;
                duration = thisDuration * (playTwice ? 2 : 1) + 8 + .8 + (playTwice ? .5 : 0);
                console.log(duration, thisDuration);

                segmentBodyTL.fromTo(donationBody, { x: 0 }, { duration: thisDuration, x: -endPoint, ease: "none" }, `+=2.8`);
                if (playTwice) {
                    segmentBodyTL.to(donationBody, { duration: .25, opacity: 0 }, "+=2")
                        .set(donationBody, { x: 0 })
                        .to(donationBody, { duration: .25, opacity: 1 })
                        .fromTo(donationBody, { x: 0 }, { duration: thisDuration, x: -endPoint, ease: "none" }, `+=2`);
                }
            }

            donationTL.to(donationWrapper, { duration: 1, "--wipe": "0%", ease: "power4.in" }, `+=${duration}`);
            gsap.fromTo(donationHeader.parentElement, { x: 0 }, { x: -80, duration: 1, ease: "power4.in", delay: duration + .8 });
            gsap.fromTo(donationBody, { x: -endPoint }, { x: -endPoint - 80, duration: 1, ease: "power4.in", delay: duration + .8 });
            donationTL.set({}, {}, "+=1")
        }
    });
}

function updateDonationTotal(obj) {
    const elem = document.querySelector('#total-raised');
    let total = 0;
    let base = parseFloat(elem.innerHTML);
    if (isNaN(base)) {
        base = 0;
    }
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].approved === false) continue;
        total += obj[i].amountUSD;
    }
    let keyframes = [];
    for (let i = base; i < total; i += Math.max(1, Math.floor((total - base) / 10))) {
        keyframes.push(i);
    }

    donationTotalTL.to(elem.parentElement, { "--shadow": "32px", "--shadow-color": "#FACA6FFF", duration: .5, ease: "power2.in"});

    for (let i = 0; i < keyframes.length; i++) {
        donationTotalTL.set(elem, 
            {text: keyframes[i].toFixed(2), ease: "power2.out"},
        `+=0.08`);
    }
    donationTotalTL.set(elem, 
        {text: total.toFixed(2), ease: "power2.out"}, 
    `+=0.08`);

    donationTotalTL.to(elem.parentElement, { "--shadow": "0px", "--shadow-color": "#FACA6F00", duration: .5, ease: "power2.out"});
}