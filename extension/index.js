const init = [
	require('./timer'),
	require('./casters'),
	require('./donationWatcher'),
];

module.exports = function(nodecg) {
	for (const initFunction of init) {
		initFunction(nodecg);
	}	
};