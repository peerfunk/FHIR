var request = require('request');
var http = require('http');
var url = require('url');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var get = require('simple-get');
var app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended: false
	}));

var headers = {
	'User-Agent': 'Super Agent/0.0.1',
	'Content-Type': 'application/json'
}
module.exports = {
	ParseAndSend: function (data) {
		return ParseAndSend(data);
	},
	deleteDevice: function(id){
		return deleteDevice(id);
	},
	validate: function (data) {
		return validate(data);
	},
	createOrUpdateDevice: function (id, name, manufacturer, model, serialNo){
		return createOrUpdateDevice(id, name, manufacturer, model, serialNo);
	}
	
}
async function deleteDevice(id){
    return new Promise(function(resolve, reject){
		
        try{
            var options = {
            url: 'http://fhirtest.uhn.ca/baseDstu3/Device/' + id,
            method: 'DELETE',
            }
			request(options, function (error, response, body) {
                if(response.statusCode == '200'){
                    console.log("Device deleted");
					resolve(true);
                }else{
                    console.log("Could not delete device");
					resolve(false);
                }
                
            });
        }catch(ex){
            resolve(null);
        }
    });
}
var jsonToFhir = {
	"resourceType": "Observation",
	"status": "final",
	"code": {
		"coding": [{
				"system": "http://ncimeta.nci.nih.gov",
				"code": "",
				"display": ""
			}
		]
	},
	"subject": {
		"reference": ""
	},
	"issued": "",
	"valueQuantity": {
		"value": 0,
		"unit": "%",
	},
};

// ----- PERSON VALIDATOR

async function validate(id,data) {
	return new Promise(function (resolve, reject) {

		var options = {
			url: 'http://fhirtest.uhn.ca/baseDstu3/Patient/' + id,
			method: 'GET',
		}

		request(options, function (error, response, body) {
			try {
				resolve(response.statusCode == '200'); //returns true or false
			} catch (ex) {
				resolve(false);
			}
		});
	})
}

//send observation request

async function sendRequest(jsonObject) {
	return new Promise(function (resolve, reject) {

		var options = {
			url: 'http://fhirtest.uhn.ca/baseDstu3/Observation',
			method: 'POST',
			headers: headers,
			json: jsonObject
		}

		request(options, function (error, response, body) {
			console.log("Request answer: " + JSON.stringify(body));
			if (response.statusCode == 201) {
				resolve(true);
			} else {
				resolve(false);
			}

		});
	}).catch(() => {
		console.log('something went wrong')
	});

}

//Server
async function ParseAndSend(data) {
    return new Promise(function(resolve, reject){
        try{
            console.log("in function ParseAndSend");
            var jsonToFhir = {
                "resourceType": "Observation",
                "status": "final",
                "code": {
                    "coding": [
                    {
                        "system": "http://ncimeta.nci.nih.gov",
                        "code": "",
                        "display":  data['Vals'][0]['Name']
                    }
                    ] 
                },
                "subject": {
                    "reference": 'Patient/' + data['PersonId']
                },
                "issued": data['TestDateTime'],  
                "valueQuantity": {
                    "value": data['Vals'][0]['Value'],
                    "unit": data['Vals'][0]['Unit'],
                },
            };

            //possible: ccrp, phenobarbital, saa, t4,lip
            if (jsonToFhir.code.coding[0]['display'] == 'SAA') {
                jsonToFhir.code.coding[0]['code'] = "C0002723";
            } else if (jsonToFhir.code.coding[0]['display'].toUpperCase() == 'CCRP') {
                jsonToFhir.code.coding[0]['code'] = "C0006560";
            } else if (jsonToFhir.code.coding[0]['display'].toUpperCase() == 'PHENOBARBITAL') {
                jsonToFhir.code.coding[0]['code'] = "C0031412";
            } else if (jsonToFhir.code.coding[0]['display'].toUpperCase() == 'T4') {
                jsonToFhir.code.coding[0]['code'] = "C0040165";
            } else if (jsonToFhir.code.coding[0]['display'].toUpperCase() == 'LIP') {
                jsonToFhir.code.coding[0]['code'] = "C0023764";
            }
            
            var options = {
                url: 'http://fhirtest.uhn.ca/baseDstu3/Observation',
                method: 'POST',
                headers: headers,
                json: jsonToFhir
            }
            console.log("...send observation");
            request(options, function (error, response, body) {
                //console.log("...receive answer: " + JSON.stringify(body));
                resolve(JSON.stringify((body)));
            });
        }catch(ex){
            resolve(ex);
        }
    });
}
/*
returns id if successfull, returns null else
*/

async function createOrUpdateDevice(id, name, manufacturer, model, serialNo){
    //check if device exists
    return new Promise(function(resolve, reject){
        var exists = false;
        var options = {
           url: 'http://fhirtest.uhn.ca/baseDstu3/Device/' + id,
           method: 'GET',
       }
       request(options, function (error, response, body) {
        
        try{
            // json Object to be sent
            var jsonDeviceReceived = 
                {
                    "resourceType": "Device",
                    "id":"",
                    "identifier": [
                        {
                        "system": "http://thisasystem.com",
                        "value": name
                        },
                        {
                        "type": {
                            "coding": [
                            {
                                "system": "http://hl7.org/fhir/identifier-type",
                                "code": "SNO" 
                            }
                            ],
                            "text": "Serial Number"
                        },
                        "value": serialNo
                        }
                    ],
                    "status": "active",    
                    "manufacturer": manufacturer,
                    "model": model
                };
           
            //exists: Update Device
            if(response.statusCode == "200") {
                console.log("Device exists")
                //get device id from get request
                
                
                jsonDeviceReceived.id = JSON.parse(body).id;
                console.log(jsonDeviceReceived.id);
                
                var options = {
                    url: 'http://fhirtest.uhn.ca/baseDstu3/Device/'+jsonDeviceReceived.id,
                    method: 'PUT',
                    headers: headers,
                    json: jsonDeviceReceived
                }

                request(options, function (error, response, body) {
                    console.log("Request PUT answer: " + JSON.stringify(body));
                    console.log(response.statusCode);
                    if(response.statusCode == "200"){
                        resolve(body.id)
                    }else{
                        resolve(null)
                    }

                });
                
                

            }
            else{
                //does not exist: Create Device
                
                console.log("Device does not exist")
                var options = {
                    url: 'http://fhirtest.uhn.ca/baseDstu3/Device',
                    method: 'POST',
                    headers: headers,
                    json: jsonDeviceReceived
                }
                    
                request(options, function (error, response, body) {
                    console.log("Request POST answer: " + JSON.stringify(body));
                    console.log(response.statusCode);
                    if(response.statusCode == "201"){
                        resolve(body.id)
                    }
                   
                    
                });
               }
        }catch(ex){
            resolve(null);
        }
       });
   });
}
