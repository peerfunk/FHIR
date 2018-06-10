var mkFhir = require('fhir.js');

var client = mkFhir({
    baseUrl: 'http://fhirtest.uhn.ca/baseDstu3'
});

var entry = {
	resource: {
  "resourceType": "Patient",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2018-06-097T15:29:55.179+00:00"
  },
  "text": {
    "status": "generated",
    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"> </div>"
  },
  "identifier": [
    {
      "use": "usual",
      "type": {
        "text": "SSN"
      },
      "value": "0905843010",
      "assigner": {
        "display": "Österreichische Sozialversicherung"
      }
    }
  ],
  "active": true,
  "gender": "unknown",
  "birthDate": "1702-10-10",
  "deceasedBoolean": false
}
}

client.create(entry,
 function(entry){
	console.log("inentry")
    console.log(entry.id)
	console.log(entry.content)
	console.log(entry.category)
 },
 function(error){
	console.log("error")
   console.error(error)
 }
)


client
    .search( {type: 'Patient', query: { 'birthdate': '1702' }})
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