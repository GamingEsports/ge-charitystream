const tokens = require('../token.json');
const fetch = require('node-fetch');

module.exports = async function(nodecg) {
    const accessToken = nodecg.Replicant('accessToken', {defaultValue: {
        token: "",
        expiresAt: 0
    }});
    const donationRep = nodecg.Replicant('cs-donations');
    const donationRefresh = nodecg.Replicant('cs-donation-refresh', {defaultValue: false});

    async function getAccessToken(){
        nodecg.log.info((accessToken.value.expiresAt - 10));
        if ((accessToken.value.expiresAt - 10) <= Date.now() || accessToken.value.token == "") {
            await fetch("https://v5api.tiltify.com/oauth/token", {
                body: `{"client_id":"${tokens['tiltify-client-id']}","client_secret":"${tokens['tiltify-client-secret']}", "grant_type": "client_credentials", "scope": "public"}`,
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST"
            }).then(res => res.json()).then(json => {
                nodecg.log.info("Tiltify access token received", JSON.stringify(json));
                accessToken.value.token = json.access_token;
                accessToken.value.expiresAt = Date.now() + json.expires_in;
                return accessToken.value.token;
            });
        }
        return accessToken.value.token;
    }

    async function importNewDonations(){
        const accessToken = await getAccessToken();
        const timestamp = unixToIsoTimestamp(findNewestDonationClone() + 1);

        await fetch(`https://v5api.tiltify.com/api/public/campaigns/${tokens['tiltify-campaign-id']}/donations?completed_after=${timestamp}&limit=100`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            method: "GET"
        }).then(res => res.json()).then(json => {
            if ("error" in json) {
                nodecg.log.error("importNewDonations error: ", JSON.stringify(json));
                return;
            }

            if (json.data.length == 0) {
                return;
            }

            for (const donation of json.data) {
                nodecg.log.info("Tiltify donation received", JSON.stringify(donation));
                const amount = parseFloat(donation.amount.value);
                const donationObj = {
                    name: donation.donor_name,
                    amount: amount,
                    currency: donation.amount.currency,
                    amountUSD: amount,    
                    message: donation.donor_comment,
                    timestamp: isoToUnixTimestamp(donation.completed_at),
                    approved: false,
                }
                donationRep.value.push(donationObj);
            }
        });
    }

    function findNewestDonationClone() {
        if (!donationRep.value || donationRep.value.length === 0) {
          return null;
        }
        const clonedData = JSON.parse(JSON.stringify(donationRep.value));
        clonedData.sort((a, b) => b.timestamp - a.timestamp);
        return clonedData[0].timestamp;
    }

    //string to seconds
    function isoToUnixTimestamp(isoTimestamp) {
        const timestampObj = new Date(isoTimestamp);
        return timestampObj.getTime();
    }      

    //seconds to string
    function unixToIsoTimestamp(unixTimestamp) {
        const date = new Date(unixTimestamp);
        return date.toISOString();
    }

    setInterval(() => {
        if (donationRefresh.value){
            importNewDonations();
        }
    }, 40 * 1000);
}