const socketToken = require('../token.json').streamlabs;
const io = require('socket.io-client');
const streamlabs = io(`https://sockets.streamlabs.com?token=${socketToken}`, {transports: ['websocket']});

module.exports = function(nodecg) {
    const donationRep = nodecg.Replicant('cs-donations', {defaultValue: []});
    
    streamlabs.on('event' , (eventData) => {
        if (eventData.type === 'donation') {
            const donation = eventData.message[0];
            const donationObj = {
                name: donation.name,
                amount: parseFloat(donation.amount),
                currency: donation.donation_currency,
                amountUSD: parseFloat(donation.amount),    
                message: donation.message,
                timestamp: Date.now(),
                approved: false
            }
            donationRep.value.push(donationObj);
        }
    });
}