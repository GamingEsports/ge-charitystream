module.exports = function(nodecg) {

    const castersRep = nodecg.Replicant('cs-casters');
    const unsavedCastRep = nodecg.Replicant('cs-unsavedCasters');

    if (castersRep.value === undefined || castersRep.value.length != 4) {
        castersRep.value = [
            {name: "", visible: false},
            {name: "", visible: false},
            {name: "", visible: false},
            {name: "", visible: false}
        ];
    } 
    
    if (unsavedCastRep.value === undefined || unsavedCastRep.value.length != 4) {
        unsavedCastRep.value = JSON.parse(JSON.stringify(castersRep.value));
    }
}
