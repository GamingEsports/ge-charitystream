const scheduleRep = nodecg.Replicant("cs-schedule");
const donationsRep = nodecg.Replicant("cs-donations");

const recentDonatinonsWrapper = document.querySelector('#recentdonationswrapper > .body');
const topDonationsWrapper = document.querySelector('#topdonationswrapper > .body');
const scheduleWrapper = document.querySelector('#schedulewrapper > .body');
const donationWrapper = document.querySelector("#donation-wrapper");
const donationHeader = document.querySelector("#donation-header");
const donationBody = document.querySelector("#donation-body");

const contentBoxTL = gsap.timeline({repeat: -1});
const donationTL = gsap.timeline();
const donationTotalTL = gsap.timeline();

NodeCG.waitForReplicants(scheduleRep, donationsRep).then(() => {
    animateContentBoxTL();

    scheduleRep.on("change", (newVal) => {
        updateSchedule(newVal);
    });

    donationsRep.on("change", (newVal) => {
        updateRecentDonations(newVal);
        updateTopDonations(newVal);
        updateDonationTotal(newVal);
    });

    setInterval(() => {
        updateRecentDonations(donationsRep.value);
        updateTopDonations(donationsRep.value);
        updateSchedule(scheduleRep.value);
    }, 15000);

    nodecg.listenFor("new-donation", (data) => {
        sendDonation(data);
    });
});

function getContentWrapperElement(header, body){
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    if (body === null) {
        body = "";
    }
    let longBody = body.length > 60;
    wrapper.innerHTML = `
        <div class="header">${header}</div>
        <div class="body ${longBody ? "small" : ""}">${body}</div>
    `;
    return wrapper;
}

function updateSchedule(obj) {
    scheduleWrapper.innerHTML = "";
    const localTime = `${new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/Chicago'})} CDT`;
    scheduleWrapper.appendChild(getContentWrapperElement(`Local Time`, localTime));
    for (let i = 0; i < obj.length && i < 20; i++) {
        const wrapper = getContentWrapperElement(obj[i].time, obj[i].name);
        scheduleWrapper.appendChild(wrapper);
    }
}

function updateRecentDonations(obj) {
    let sortedObj = JSON.parse(JSON.stringify(obj));

    sortedObj.sort((a, b) => {
        return b.timestamp - a.timestamp;
    });

    recentDonatinonsWrapper.innerHTML = "";

    for (let i = 0; i < sortedObj.length && i < 8; i++) {
        if (sortedObj[i].approved === false) continue;
        const timeDiff = Date.now() - sortedObj[i].timestamp;
        const timeDiffStr = formatTime(timeDiff / 1000);
        const header = `$${sortedObj[i].amountUSD.toFixed(2)} • ${sortedObj[i].name} • ${timeDiffStr}`
        const wrapper = getContentWrapperElement(header, sortedObj[i].message);
        recentDonatinonsWrapper.appendChild(wrapper);
    }
}

function updateTopDonations(obj) {
    let sortedObj = JSON.parse(JSON.stringify(obj));

    sortedObj.sort((a, b) => {
        return b.amountUSD - a.amountUSD;
    });

    topDonationsWrapper.innerHTML = "";

    for (let i = 0; i < sortedObj.length && i < 8; i++) {
        if (sortedObj[i].approved === false) continue;
        const timeDiff = Date.now() - sortedObj[i].timestamp;
        const timeDiffStr = formatTime(timeDiff / 1000);
        const header = `$${sortedObj[i].amountUSD.toFixed(2)} • ${sortedObj[i].name} • ${timeDiffStr}`
        const wrapper = getContentWrapperElement(header, sortedObj[i].message);
        topDonationsWrapper.appendChild(wrapper);
    }
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

function formatTime(seconds){
    if (seconds < 60){
        return `Now`;
    }
    if (seconds < 3600){
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes == 1 ? "" : "s"} ago`;
    }
    if (seconds < 86400){
        const hours = Math.floor(seconds / 3600);
        return `${hours} hour${hours == 1 ? "" : "s"} ago`;
    }
    const days = Math.floor(seconds / 86400);
    return `${days} day${days == 1 ? "" : "s"} ago`;
}

function animateContentBoxTL(){
    const segments = [scheduleWrapper,recentDonatinonsWrapper,topDonationsWrapper];
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i].parentElement;
        gsap.set(segment, {opacity: 0, display: "none", x: 0});

        contentBoxTL.fromTo(segment, {x: -60}, {duration: 0.5, x: 0, opacity: 1, display: "block", ease: "power2.out"}, "+=0.25");
        contentBoxTL.to(segment, {duration: 0.5, x: 60, opacity: 0, display: "none", ease: "power2.in"}, "+=10");
    }
}

function sendDonation(info) {
    let duration = 20;
    console.log("new donation", info);
    donationTL.to(donationWrapper, {
        duration: .8, "--wipe": "100%", ease: "power3.out"
        , onStart: () => {
            donationHeader.innerHTML = `From ${info.name} / $${info.amount.toFixed(2)}`;
            if (info.message != null && info.message != "") {
                donationBody.innerHTML = info.message;
                donationHeader.parentElement.style.fontSize = "22px";
            } else {
                donationBody.innerHTML = "";
                donationHeader.parentElement.style.fontSize = "36px";
            }

            if (donationHeader.offsetWidth > 680){
                donationHeader.style.transform = `scaleX(${680 / donationHeader.offsetWidth})`;
                donationHeader.style.transformOrigin = "left";
            } else {
                donationHeader.style.transform = `scaleX(1)`;
            }

            gsap.set(donationBody, { x: 0 });

            gsap.fromTo([donationHeader.parentElement, donationBody], { x: -80 }, { x: 0, duration: .8, ease: "power3.out" });

            let endPoint = Math.max(710, donationBody.offsetWidth) - 710;
            if (donationBody && donationBody.offsetWidth > 710) {
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