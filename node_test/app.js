var mkFhir = require('fhir.js');

var client = mkFhir({
    baseUrl: 'http://fhirtest.uhn.ca/baseDstu3'
});

client
    .search( {type: 'Patient', query: { 'birthdate': '1960' }})
    .then(function(res){
        var bundle = res.data;
        var count = (bundle.entry && bundle.entry.length) || 0;
		if (count> 0)
			bundle.entry.forEach(function (item) {
				console.log(item);
			});
    })
    .catch(function(res){
        //Error responses
        if (res.status){
            console.log('Error', res.status);
        }

        //Errors
        if (res.message){
            console.log('Error', res.message);
        }
    });
