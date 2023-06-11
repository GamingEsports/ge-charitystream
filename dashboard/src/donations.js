const donationRep = nodecg.Replicant('cs-donations');

const approvedDonationWrapper = document.querySelector("#approvedDonationWrapper");
const unapprovedDonationWrapper = document.querySelector("#unapprovedDonationWrapper");
const unapprovedNotice = document.querySelector("#unapprovedNotice");

if (window.location.href.includes("standalone=true")) {
    document.head.innerHTML += `<link rel="stylesheet" href="standalone-style.css">`
}

NodeCG.waitForReplicants(donationRep).then(() => {

    donationRep.on('change', (newVal) => {
        approvedDonationWrapper.innerHTML = "";
        unapprovedDonationWrapper.innerHTML = "";
        let unapprovedCount = 0;

        for (let i = 0; i < newVal.length; i++) {
            if (newVal[i].approved) {
                approvedDonationWrapper.appendChild(getApprovedDonationElement(newVal[i], i));
            } else {
                unapprovedDonationWrapper.appendChild(getUnapprovedDonationElement(newVal[i], i));
                unapprovedCount++;
            }
        }

        if (unapprovedCount > 0) {
            unapprovedNotice.innerHTML = `⚠ ${unapprovedCount} unapproved donation${unapprovedCount > 1 ? "s" : ""}`;
            unapprovedNotice.style.display = "block";
        } else {
            unapprovedNotice.style.display = "none";
        }
    });
    
});

function getUnapprovedDonationElement(value, index){
    const donationElement = document.createElement("div");
    donationElement.classList.add("section");
    donationElement.innerHTML = `   
        <div><span class="tag">Name</span> ${value.name}</div>
        <div><span class="tag">Amount</span> ${value.amount.toFixed(2)} ${value.currency}</div>
        <div><span class="tag">Message</span> ${value.message}</div>
        <div style="margin-bottom: 6px"><span class="tag">Time</span> ${new Date(value.timestamp).toLocaleString()}</div>
    `;

    const optionsWrapper = document.createElement("div");

    //create a label for the amount input
    const amountLabel = document.createElement("label");
    amountLabel.for = "amount" + index;
    amountLabel.innerHTML = "USD Amount";
    amountLabel.style.marginRight = "10px";
    optionsWrapper.appendChild(amountLabel);

    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.id = "amount" + index;
    amountInput.value = value.amount;
    amountInput.style.marginRight = "10px";
    amountInput.style.width = "60px";
    optionsWrapper.appendChild(amountInput);

    optionsWrapper.appendChild(document.createElement("br"));

    const hideName = document.createElement("input");
    hideName.type = "checkbox";
    hideName.id = "hideName" + index;
    optionsWrapper.appendChild(hideName);

    const hideNameLabel = document.createElement("label");
    hideNameLabel.for = "hideName" + index;
    hideNameLabel.innerHTML = "Hide Name";
    hideNameLabel.style.marginRight = "10px";
    optionsWrapper.appendChild(hideNameLabel);

    optionsWrapper.appendChild(document.createElement("br"));

    const hideMessage = document.createElement("input");
    hideMessage.type = "checkbox";
    hideMessage.id = "hideMessage" + index;
    optionsWrapper.appendChild(hideMessage);

    const hideMessageLabel = document.createElement("label");
    hideMessageLabel.for = "hideMessage" + index;
    hideMessageLabel.innerHTML = "Hide Message";
    hideMessageLabel.style.marginRight = "10px";
    optionsWrapper.appendChild(hideMessageLabel);

    optionsWrapper.appendChild(document.createElement("br"));

    const approveButton = document.createElement("button");
    approveButton.classList.add("green");
    approveButton.innerHTML = "Approve";
    approveButton.addEventListener("click", () => {
        if (document.querySelector("#hideName" + index).checked){
            donationRep.value[index].name = "Anonymous";
        }
        let hidden = false;
        if (document.querySelector("#hideMessage" + index).checked){
            donationRep.value[index].message = "";
            hidden = true;
        }
        const amountUSD = parseFloat(document.querySelector("#amount" + index).value);
        donationRep.value[index].amountUSD = amountUSD
        donationRep.value[index].currency = "USD";
        donationRep.value[index].approved = true;
        console.log("sent donation", donationRep.value[index]);
        nodecg.sendMessage("new-donation", {
            name: value.name,
            amount: amountUSD,
            message: !hidden ? value.message : null
        });
    });
    optionsWrapper.appendChild(approveButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerHTML = "Delete";
    deleteButton.addEventListener("click", () => {
        donationRep.value.splice(index, 1);
    });
    optionsWrapper.appendChild(deleteButton);

    donationElement.appendChild(optionsWrapper);

    return donationElement;
}

function getApprovedDonationElement(value){
    const donationElement = document.createElement("div");
    donationElement.classList.add("section");
    donationElement.innerHTML = `   
        <div><span class="tag">Name</span> ${value.name}</div>
        <div><span class="tag">Amount</span> ${value.amountUSD.toFixed(2)} ${value.currency}</div>
        <div><span class="tag">Message</span> ${value.message}</div>
        <div><span class="tag">Time</span> ${new Date(value.timestamp).toLocaleString()}</div>
    `;
    return donationElement;
}