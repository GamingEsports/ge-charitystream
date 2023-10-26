const init = [
	require('./timer'),
	require('./casters'),
	require('./tiltifyWatcher'),
];

module.exports = function(nodecg) {
	for (const initFunction of init) {
		initFunction(nodecg);
	}	
};