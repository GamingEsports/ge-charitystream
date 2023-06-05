const scheduleRep = nodecg.Replicant("cs-schedule");
const donationsRep = nodecg.Replicant("cs-donations");

const recentDonatinonsWrapper = document.querySelector('#recentdonationswrapper > .body');
const topDonationsWrapper = document.querySelector('#topdonationswrapper > .body');
const scheduleWrapper = document.querySelector('#schedulewrapper > .body');

const contentBoxTL = gsap.timeline({repeat: -1});

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
    let total = 0;
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].approved === false) continue;
        total += obj[i].amountUSD;
    }
    document.querySelector('#total-raised').innerHTML = total.toFixed(2);
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
}

function animateContentBoxTL(){
    const segments = [scheduleWrapper,recentDonatinonsWrapper,topDonationsWrapper];
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i].parentElement;
        gsap.set(segment, {opacity: 0, display: "none", x: 0});

        contentBoxTL.fromTo(segment, {x: -40}, {duration: 0.5, x: 0, opacity: 1, display: "block", ease: "power2.out"}, "+=0.25");
        contentBoxTL.to(segment, {duration: 0.5, x: 40, opacity: 0, display: "none", ease: "power2.in"}, "+=10");
    }
}