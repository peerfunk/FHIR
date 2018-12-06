var request = require('request');
var http = require('http');
var url = require('url');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var get = require('simple-get');
var app = express();
var async =  require('async');

/** Global constants */

const BASE_URL_FHIR = 'http://fhirtest.uhn.ca/baseDstu3/'
const URL_DEVICE = BASE_URL_FHIR + 'Device/'
const URL_PATIENT = BASE_URL_FHIR + 'Patient/'
const URL_OBSERVATION = BASE_URL_FHIR + 'Observation/'
const headers = {
	'User-Agent': 'Super Agent/0.0.1',
	'Content-Type': 'application/json'
}

/** app config */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended: false
}));


module.exports = {
    parseAndSend: function (data) {
        return parseAndSend(data);
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

/**
 * Creates or updates device on FHIR Server, depending on id
 * @param {string} id - The FHIR id which identifies the device
 * @param {string} name - The device identifier value
 * @param {string} manufacturer - The manufacturer of the device
 * @param {string} model - The device model
 * @param {string} serialNo - The device serial number
 * @return {string} The server response body
 */

async function createOrUpdateDevice(id, name, manufacturer, model, serialNo){
    console.log('[LOG] function createOrUpdateDevice entered')
    return new Promise(function(resolve, reject){

        var options = {
           url: URL_DEVICE + id,
           method: 'GET',
        }

        // check if device with id exists 
        console.log('[LOG] checking if device exists on FHIR Server')
        request(options, function (error, response, body) {
        try{
            var jsonTemplate = 
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

            console.log('[LOG] device: '+ JSON.stringify(jsonTemplate, null, 2))
            // Device exists 
            if(response.statusCode == "200") {
                console.log('[LOG] device exists')

                //get device id from get request
                jsonTemplate.id = JSON.parse(body).id;
                console.log('[LOG] device id: ' + jsonTemplate.id)
                
                var options = {
                    url: URL_DEVICE+jsonTemplate.id,
                    method: 'PUT',
                    headers: headers,
                    json: jsonTemplate
                }
 
                console.log('[LOG] update device')
                request(options, function (error, response, body) {

                    // update successfull
                    if(response.statusCode == "200"){
                        console.log('[LOG] update successful')
                        console.log('[LOG] returned device: \n' + JSON.stringify(body, null, 2))
                        resolve(body.id)
                    }
                    // update failed
                    else{
                        console.log('[LOG] update failed. Returning null')
                        resolve(null)
                    }

                });
            }
            // Device does not exist
            else{
                console.log('[LOG] device does not exist')
                var options = {
                    url: URL_DEVICE,
                    method: 'POST',
                    headers: headers,
                    json: jsonTemplate
                }
                    
                request(options, function (error, response, body) {
                    // creation successfull
                    if(response.statusCode == "201"){
                        console.log('[LOG] creation successful')
                        console.log('[LOG] returned device: \n' + JSON.stringify(body, null, 2))
                        resolve(body.id)
                    }
                    // creation failed
                    else{
                        console.log('[LOG] could not create device')
                        console.log('[LOG] error: ' + error)
                        resolve(null)
                    }
                });
               }
        }catch(ex){
            console.log('[LOG] exception: ' + ex)
            resolve(null);
        }
       });
   });
}

/**
 * Deletes device on FHIR Server by id
 * @param {string} id - The FHIR id which identifies the device
 * @return {boolean} The successfulness of deletion
 */
async function deleteDevice(id){
    console.log('[LOG] function deleteDevice entered')
    return new Promise(function(resolve, reject){
        try{
            var options = {
            url: URL_DEVICE + id,
            method: 'DELETE',
            }
			request(options, function (error, response, body) {
                if(response.statusCode == '200'){
                    console.log("[LOG] Device deleted");
					resolve(true);
                }else{
                    console.log("[LOG] Could not delete device");
					resolve(false);
                }
            });
        }catch(ex){
            console.log('[LOG] exception: ' + ex)
            resolve(null);
        }
    });
}

// TODO: check what param data is for -- callback??

/**
 * Checks if patient exists on FHIR server
 * @param {string} id - The FHIR id which identifies the patient
 * @param {string} data - The callback value 
 * @return {boolean} The existence of the patient
 */
async function validate(id,data) {
    console.log('[LOG] function validate entered')
	return new Promise(function (resolve, reject) {

		var options = {
			url: URL_PATIENT + id,
			method: 'GET',
		}

		request(options, function (error, response, body) {
			try {
                var exists = response.statusCode == '200'
                if(exists){
                    console.log("[LOG] patient exists");
                }else{
                    console.log("[LOG] patient does not exist");
                }
				resolve(exists); 
			} catch (ex) {
                console.log('[LOG] exception: ' + ex)
				resolve(false);
			}
		});
	})
}

/**
 * Sends a post request to FHIR server with observation resource
 * @param {json} jsonObject - The observation resource
 * @return {boolean} The successfulness of creation of the observation resource
 */
async function sendRequest(jsonObject) {
    console.log('[LOG] function sendRequest entered')
	return new Promise(function (resolve, reject) {
		var options = {
			url: URL_OBSERVATION,
			method: 'POST',
			headers: headers,
			json: jsonObject
		}

		request(options, function (error, response, body) {
			if (response.statusCode == 201) {
                console.log("[LOG] observation created");
                console.log('[LOG] observation: \n' + JSON.stringify(body, null, 2))
				resolve(true);
			} else {
                console.log("[LOG] observation could not be created");
                console.log('[LOG] response: \n' + JSON.stringify(body, null, 2))
				resolve(false);
			}

		});
	}).catch(() => {
		console.log('[ERROR] something went wrong')
	});

}


/**
 * Parses and sends data to FHIR server
 * @param {json} data - The data, including: 
 * PersonId - The pattient id identical with FHIR id
 * TestName - The name of the test
 * TestDateTime - The execution time of the test
 * Vals - the resul(s) of the test
 * @return {string} The created FHIR id or null
 */
async function parseAndSend(data) {
    /**
     * Example of param data:
    { 
        PersonId: '0',
        TestName: 'NoName',
        TestDateTime: 2018-01-21T13:01:00.000Z,
        Vals:
        [ 
            { Name: 'cCRP', Value: '417.7', Unit: ' mg/l' },
            { Name: 'T4', Value: '417.7', Unit: ' mg/l' } 
        ] 
    }
     * 
     */
    console.log('[LOG] function parseAndSend entered')
    console.log('[LOG] data: \n' + JSON.stringify(data, null, 2))
    try{
        
        observations = [];
        // get every measurement
        if(data['Vals'].length<1){
            console.log('[ERROR] no elements in list \"Vals\"' )
            return null;
        }else if (data['Vals'].length==1){
            id = await sendSingleObservation(data.PersonId, data.TestDateTime, data.Vals[0]);
            return id;
        }else{
            
            for(i=0;i<data.Vals.length;++i){
                var observation = await sendSingleObservation(data.PersonId, data.TestDateTime, data.Vals[i], null);
                
                //if one post did not work, break
                if(observation==null){
                    return null;
                }
                observations.push(observation);
            }
            //add related target to each observation
            for(i=0;i<observations.length-1;++i){
                await updateObservationRelatedTarget(observations[i], observations[i+1]);
            }
            await updateObservationRelatedTarget(observations[observations.length-1], observations[0]);
            //return FHIR id of first observation
            return observations[0].id;
                
        }
    }catch(error){
        console.log("[LOG] error: + " + error);
        return null;
    }
}


/**
 * 
 * @param {string} patientId - The id of the patient
 * @param {string} time - The issued time
 * @param {json} value - The details of the measurement (value name, value, value unit)
 * @param {string} idOfRelatedObservation  The id of the related observation resource
 * @return {string} - The observation
 */
async function sendSingleObservation(patientId, time, value, idOfRelatedObservation){
    console.log('[LOG] function sendSingleObservation entered')
    return new Promise(function(resolve, reject){
        try{
            /**
             * related.type = "has-member" 
             * meaning: 
             * This observation is a group observation 
             * (e.g. a battery, a panel of tests, a set of vital sign measurements) 
             * that includes the target as a member of the group.
             */
            var jsonTemplate = {
                "resourceType": "Observation",
                "status": "final",
                "code": {
                    "coding": [
                    {
                        "system": "http://ncimeta.nci.nih.gov",
                        "code": "",
                        "display":  value['Name']
                    }
                    ] 
                },
                "subject": {
                    "reference": 'Patient/' + patientId
                },
                "issued": time,
                "valueQuantity": {
                    "value": value['Value'],
                    "unit": value['Unit'],
                }
            };
            if(idOfRelatedObservation != null){
                jsonTemplate["related"] = 
                [
                    {
                    "type": "has-member",
                    "target": {
                        "reference": "Observation/" + idOfRelatedObservation
                    }
                    }
                ]
            }

            //possible: ccrp, phenobarbital, saa, t4,lip
            if (jsonTemplate.code.coding[0]['display'] == 'SAA') {
                jsonTemplate.code.coding[0]['code'] = "C0002723";
            } else if (jsonTemplate.code.coding[0]['display'].toUpperCase() == 'CCRP') {
                jsonTemplate.code.coding[0]['code'] = "C0006560";
            } else if (jsonTemplate.code.coding[0]['display'].toUpperCase() == 'PHENOBARBITAL') {
                jsonTemplate.code.coding[0]['code'] = "C0031412";
            } else if (jsonTemplate.code.coding[0]['display'].toUpperCase() == 'T4') {
                jsonTemplate.code.coding[0]['code'] = "C0040165";
            } else if (jsonTemplate.code.coding[0]['display'].toUpperCase() == 'LIP') {
                jsonTemplate.code.coding[0]['code'] = "C0023764";
            }
            
            var options = {
                url: URL_OBSERVATION,
                method: 'POST',
                headers: headers,
                json: jsonTemplate
            }
           
            console.log('[LOG] sending observation to FHIR server')
            console.log('[LOG] observation: \n' +  JSON.stringify(jsonTemplate, null, 2))
            request(options, function (error, response, body) {
                if (response.statusCode == 201) {
                    console.log("[LOG] observation created");
                    console.log('[LOG] observation: \n' + JSON.stringify(body, null, 2))
                    resolve(body);
                } else {
                    console.log("[LOG] observation could not be created");
                    console.log('[LOG] response: \n' + JSON.stringify(body, null, 2))
                    resolve(null);
                }
          
            });
        }catch(ex){
            console.log('[EXCEPTION] ' + ex)
            resolve(null);
        }
        
    });
}

/**
 * 
 * @param {string} observation - The observation in json
 * @param {string} targetId - the related FHIR observation
 * @return {string} The updated observation id
 */
async function updateObservationRelatedTarget (observation, target){
    console.log('[LOG] function updateObservationRelatedTarget entered')
	return new Promise(function (resolve, reject) {
       
        if(observation != null){
            console.log('[LOG] observation with id '+ observation.id + ' exists');
            console.log('[LOG] observation: \n' + JSON.stringify(observation, null, 2));

            observation["related"] = 
            [
                {
                  "type": "has-member",
                  "target": {
                    "reference": "Observation/" + target.id
                  }
                }];
            console.log('[LOG] observation with new related attribute: \n' + JSON.stringify(observation, null, 2));

            var options = {
                url: URL_OBSERVATION + observation.id,
                method: 'PUT',
                headers: headers,
                json: observation
            }

            request(options, function (error, response, body) {
                if(response.statusCode == '200'){
                    console.log("[LOG] observation updated");
                    console.log('[LOG] updated observation: \n' + JSON.stringify(body, null, 2));
					resolve(body.id);
                }else{
                    console.log("[LOG] update of observation failed");
                    console.log('[LOG] response: \n' + JSON.stringify(body, null, 2));
					resolve(null);
                }
            });


        }else{
            console.log('[LOG] error: no observation with id '+ id + ' exists');
            resolve(null);
        }
    });
}

/**
 * 
 * @param {string} url - The url to the resource
 * @param {string} id  - The id of the resource
 * @return {json} the resource or null, if resource does not exists
 */
async function getResource(url, id){
    console.log('[LOG] function getResource entered')
    console.log('[LOG] url: ' + url + ' id: ' + id)
    return new Promise(function (resolve, reject) {
        var options = {
			url: url + id,
			method: 'GET',
		}

		request(options, function (error, response, body) {
			try {
                var exists = response.statusCode == '200'
                if(exists){
                    console.log("[LOG] resource exists");
                    console.log("[LOG] resource: \n" + JSON.stringify(response.body, null, 2))
                    resolve(response.body);
                }else{
                    console.log("[LOG] resource does not exist");
                    console.log("[LOG] response: \n" + JSON.stringify(response.body, null, 2))
                    resolve(null);
                }
				 
			} catch (ex) {
                console.log('[LOG] exception: ' + ex)
				resolve(null);
			}
		});
	})
}
/**
 * 
 * @param {string} url - The  url to the FHIR server and resource type
 * @param {string} id  - The id of the resource
 * @return {boolean} - if resource exists
 */
async function resoureExists(url, id){
    console.log('[LOG] function resoureExists entered')
    console.log('[LOG] url: ' + url + ' id: ' + id)
    return new Promise(function (resolve, reject) {
        var options = {
			url: url + id,
			method: 'GET',
		}

		request(options, function (error, response, body) {
			try {
                var exists = response.statusCode == '200'
                if(exists){
                    console.log("[LOG] resource exists");
                    console.log("[LOG] resource: \n" + JSON.stringify(response.body, null, 2))
                }else{
                    console.log("[LOG] resource does not exist");
                    console.log("[LOG] response: \n" + JSON.stringify(response.body, null, 2))
                }
				resolve(exists); 
			} catch (ex) {
                console.log('[LOG] exception: ' + ex)
				resolve(false);
			}
		});
	})
}

    
var data = { 
    PersonId: '436077',
    TestName: 'NoName',
    TestDateTime: '2018-01-21T13:01:00.000Z',
    Vals:
    [ 
        { Name: 'cCRP', Value: '417.7', Unit: ' mg/l' },
        { Name: 'T4', Value: '417.7', Unit: ' mg/l' } 
    ] 
}

//console.log(parseAndSend(data))


var observation = {
    "resourceType": "Observation",
    "id": "464931",
    "meta": {
        "versionId": "1",
        "lastUpdated": "2018-11-13T19:23:37.384+00:00"
    },
    "status": "final",
    "code": {
        "coding": [
            {
                "system": "http://ncimeta.nci.nih.gov",
                "display": "CCRP"
            }
        ]
    },
    "subject": {
        "reference": "Patient/436077"
    },
    "issued": "2018-11-11T11:03:43.110+00:00",
    "related":[
          {
            "type": "has-member",
            "target": {
              "reference": "Observation/464930"
            }
          }],
    "valueQuantity": {
        "value": 118,
        "unit": "mg/dL"
    }
};


var target = {
    "resourceType": "Observation",
    "id": "464938",
    "meta": {
        "versionId": "1",
        "lastUpdated": "2018-11-13T19:28:50.059+00:00"
    },
    "status": "final",
    "code": {
        "coding": [
            {
                "system": "http://ncimeta.nci.nih.gov",
                "display": "CCRP"
            }
        ]
    },
    "subject": {
        "reference": "Patient/436077"
    },
    "issued": "2018-11-11T11:03:43.110+00:00",
    "valueQuantity": {
        "value": 118,
        "unit": "mg/dL"
    }
};

//updateObservationRelatedTarget (observation, target);