const donationsRep = nodecg.Replicant("cs-donations");

NodeCG.waitForReplicants(donationsRep).then(() => {
    donationsRep.on("change", (newVal) => {
        const total = getDonationTotal(newVal);;
        updateDonationBar(total);
    });
});

function getDonationTotal(obj){
    let total = 0;
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].approved === false) continue;
        total += obj[i].amountUSD;
    }
    return total;
}

function updateDonationBar(total){
    const percent = (total / 2500) * 100;
    gsap.to(document.body, {duration: 1, "--prog": percent + "%", ease: "power1.out"});
}