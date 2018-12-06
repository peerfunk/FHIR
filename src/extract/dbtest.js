const mongoose = require('mongoose');
const SerialPort = require('serialport');
const Regex = require('@serialport/parser-test')

const datex = require('date-and-time');
const await = require("await");
const async = require("async")
const sender = require('../extract/ninaSend');
mongoose.connect('mongodb://localhost:27017/datahub', {
	useNewUrlParser: true
});
var fs = require('fs');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log("Conncted to MongoDB Server")
});
module.exports = {
	updateDevs: function () {
		devs.Reload();
	},
	sendToFhir: function (id,obj, callback) {
		testi.sendToFhir(id,obj,callback);
	}
}
var testLog = new mongoose.Schema({
	id: Number,
	
});
var DeviceSchema = new mongoose.Schema({
		id: Number,
		title: {
			type: String,
			required: true
		},
		SerConn: String,
		BaudeRate: Number,
		MessageDefinition: String,
		PersonIdDefinition: String,
		TestNameDefinition: String,
		TestDateDefinition: String,
		TestTimeDefinition: String,
		ValueGroupDefinition: String,
		ValueNameDefinition: String,
		ValueDefinition: String,
		ValueUnitDefinition: String,
		DateTimeFormat: String
	});

var TestSchema = new mongoose.Schema({
		id: Number,
		TestName: String,
		TestDateTime: {
			type: Date,
		default:
			Date.now
		},
		PersonId: String,
		Vals: [{
				Name: String,
				Value: Number,
				Unit: String
			}
		],
		Device: {
			type: mongoose.Schema.Types.ObjectId,
		default:
			null
		}
	});
class Tests {
	constructor() {
		this.schm = mongoose.model('testdatas', TestSchema);
	}

	saveTest(testname, testdate, personid, values, devid) {
		//console.log('Sending');
		const curTest = new this.schm({
				TestName: testname,
				TestDateTime: testdate,
				PersonId: personid,
				Vals: values,
				Device: devid
			});
		
		//console.log(curTest.PersonId);
		curTest.save().then(() => console.log('Test saved: \r\n' + curTest));
	}
	printAll() {
		this.schm.find({}).exec(function (err, data) {
			err + console.log("Loading Tests from Database \n" + data + "\n -------------------------------");
		});
	}
	sendToFhir(id,obj, callback) {
		console.log(obj);
		this.schm.findOne({_id: id}).exec(function (err, data) {
			console.log("[LOG] IN dbTest.SendToFhir");
			console.log("[LOG] Validating Person with data: {" + data  + "}");
				sender.validate(data.PersonId).then(function(valid){
					if(valid){
						console.log("[LOG] Person valid!")
						sender.parseAndSend({PersonId:data.PersonId, TestName: data.TestName, TestDateTime: data.TestDateTime, Vals:data.Vals}).then(function(out){callback(out,obj);}).bind(obj);			
					}else{
						console.log("[LOG] Person invalid!")
					}
					
				}.bind(data,obj));
			
			});
	}
}
var testi = new Tests();
var ports = new Array();
var parsers = new Array();
var connectedDevices = new Array();

/*
* parser funktion is used by Serial com library to parse the incoming stream
*/

function parser(toParse, device) { //, id, name, date, time, valuename, value, unit
	var date = toParse.match(new RegExp(device.TestDateDefinition))[1];
	var time = toParse.match(new RegExp(device.TestTimeDefinition))[1];
	var datetime = datex.parse(date + ' ' + time, device.DateTimeFormat, true);
	var name = toParse.match(new RegExp(device.TestNameDefinition))[1];
	var id = toParse.match(new RegExp(device.PersonIdDefinition))[1];
	var valueGroup = toParse.match(new RegExp(device.ValueGroupDefinition,"gm"));
	var Values = new Array();
	while(valueGroup.length>0){
	   var elem = valueGroup.shift();
	   Values.push({   Name: elem.match(new RegExp(device.ValueNameDefinition,"g"))[0] , 
					Value: elem.match(new RegExp(device.ValueDefinition,"g"))[0] ,
					Unit: elem.match(new RegExp(device.ValueUnitDefinition,"g"))[0],		
				});
	}
	// var valueName = valueGroup.match(new RegExp(device.ValueNameDefinition))[1];
	// var value = valueGroup.match(new RegExp(device.ValueDefinition))[1];
	// var valueUnit = valueGroup.match(new RegExp(device.ValueUnitDefinition))[1];
	//console.log(matchAll(toParse, device.ValueNameDefinition));
	//console.log(valueGroup.match(new RegExp("Specie:.*[\n.*]*Range:")));
	
	if (name == undefined)
		name = 'NoName';
	
	console.log("[LOG] TestData Received: " + {PersonId:id, TestName: name, TestDateTime: datetime, Vals:[{ Name: valueName, Value : value, Unit : valueUnit }]})
	/*
	* if Person id is not known on fhir server then save it locally
	*/
	sender.validate(id).then(function(ret){
	
		if(ret){
			console.log("[LOG] Perserson found trying to send to FHIR Server");
			sender.parseAndSend({PersonId:id, TestName: name, TestDateTime: datetime, Vals:Values});	
		}else{
			console.log("[LOG] Could not find Person with id:" + id);
			testi.saveTest(name, datetime, id, Values, device._id);	
		}
	});
		
}
function reconnectDevice(conn) {
	   console.log('[LOG] Trying to Recoonect Devices');
	   setTimeout(function(){
		 console.log('[LOG]  Reconnecting Device: ' + conn);
		 devs.Reload();
	   }, 10000);
}
class Devices {
	constructor() {
		this.Reload();
	}
	Reload() {
		console.log('[LOG] Loading Devices');
		// ports.forEach(function (elem) {
			// if (elem.binding.fd != null) {
				// elem.close();
			// }
		// });
		connectedDevices.forEach(function (elem) {
			if (elem.binding.fd != null) {
				elem.close();
			}
		});
		// ports = new Array();
		// parsers = new Array();
		connectedDevices = new Array();
		this.schm = mongoose.model('Devices', DeviceSchema);

		this.schm.find({}).exec(this.init);
	}
	
	init(err, data) {
		if (!err && data.length > 0) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].SerConn != undefined && data[i].SerConn != '') {
					//---------------------------------------------------
					var curDevice = new SerialPort(data[i].SerConn, {
						baudRate: data[i].BaudeRate,
						disconnectedCallback: function() {console.log('[Warning] Device Disconnected!');} 
					});
					curDevice.pipe(new Regex(data[i], function (values, device) {
								//fs.appendFileSync('messages.log',values );
								parser(values, device);
							}, {
								rmain: new RegExp(data[i].MessageDefinition)
							})).on('data', function (data) {});
					curDevice.on('close', function(){
						console.log("Closed");
						reconnectDevice();
					});

					curDevice.on('error', function (err) {
						console.log("[ERROR] Device Error!");
						console.error("[ERROR] Device Error!", err);
						reconnectDevice();
					});

					curDevice.on('disconnected', function (err) {
						console.log("[Warning] Device disconnected!");
						reconnectDevice();
					}); 
					//console.log(curDevice);
					connectedDevices.push(curDevice);
					
					
					
					//---------------------------------------------------
					
					
					
					
					// ports.push(new SerialPort(data[i].SerConn, {
							// baudRate: data[i].BaudeRate,
							// disconnectedCallback: function() {console.log('You pulled the plug!');}
						// },function (err) {
							// console.log(err);
							// if (err) {
								// setTimeout(function(){
									// console.log('RECONNECTING TO ARDUINO');
									
            					  // }, 2000);
								// //return console.log('Error: ', err.message);
							// }
						// }));
					// parsers.push(ports[ports.length - 1].pipe(new Regex(data[i], function (values, device) {
								// //fs.appendFileSync('messages.log',values );
								// parser(values, device);
							// }, {
								// rmain: new RegExp(data[i].MessageDefinition)
							// })))
					//parsers[parsers.length - 1].on('data', function (data) {})
					// console.log(ports.length + " Device(s) found!")
					// console.log(ports);
				}
			}
		}
	}
	
	createNew(name, connection, reg) {
		const curDev = new this.schm({
				Name: name,
				SerConn: connection,
				
				Regex: reg
			});
		curDev.save().then(() => console.log('[LOG] Saving new Device to Database - saved :' + curDev));
	}

}

// class Input{
// constructor(){

// }
// }
class dbtest {
	constructor() {
		console.log('test');
	}
}
var devs = new Devices();

//devi.createNew("hema", "COM14", "/[\r]+/");