module.exports = function(nodecg) {
	const timerRep = nodecg.Replicant('cs-timer', {
		defaultValue: {startTime: -1, currentTime: -1, lastPauseTime: -1, active: false}
	});

	if (timerRep.value.startTime == -1) {
		timerRep.value.startTime = Math.floor(Date.now() / 1000);
	}

	if (timerRep.value.currentTime == -1) {
		timerRep.value.currentTime = timerRep.value.startTime;
	}

	//update the current time every second
	setInterval(() => {
		if (timerRep.value.active) {
			timerRep.value.currentTime = Math.floor(Date.now() / 1000);
		}
	}
	, 1000);

	timerRep.on('change', (newVal, oldVal) => {
		if (oldVal == undefined) {
			return;
		}

		if (newVal.active && !oldVal.active) {
			timerRep.value.startTime = timerRep.value.startTime + ((Math.floor(Date.now() / 1000) - timerRep.value.lastPauseTime));
			timerRep.value.currentTime = Math.floor(Date.now() / 1000);
		} else if (!newVal.active && oldVal.active) {
			timerRep.value.lastPauseTime = Math.floor(Date.now() / 1000);
		}
	});
}