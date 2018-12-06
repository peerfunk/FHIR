var keystone = require('keystone');

var Types = keystone.Field.Types;
var dbtest = require('../../extract/dbtest.js');
var sender = require('../../extract/ninaSend.js');

const SerialPort = require('../../extract/node_modules/serialport');
var async = require('async');



// function set(){
	// let rs = SerialPort.list().then(){
		// var devices =[];
	
		// for(var x=0; x<rs.length; x++){
			// devices.push(rs[x].comName);
		// }
		// return devices
		
	// }
	
// };

 //var x = set();
 // console.log(x);r

var Devices = new keystone.List('Devices', {
	  autokey: { path: 'slug', from: 'title', unique: true },
	  map: { name: 'title' }
	});	
	Devices.add({
	  title: { type: String, required: true },
	  SerConn : { type: String },
	  BaudeRate: Number,
	  MessageDefinition: {type: String},
	  PersonIdDefinition: String,
	  TestNameDefinition: String,
	  TestDateDefinition: String,
	  TestTimeDefinition: String,
	  ValueGroupDefinition: String,
	  ValueNameDefinition: String,
	  ValueDefinition: String,
	  ValueUnitDefinition:String,
	  DateTimeFormat:String,
	  manufacturer:String,
	  model:String,
	  SerialNumber:String,
	  fhirId: {type:Number, noedit: true }
	});
	Devices.schema.pre('save', function (next) {
		var x = this;
		sender.createOrUpdateDevice(this.fhirId, this.title, this.manufacturer, this.model, this.SerialNumber).then(function(ret){
			x.fhirId = ret;
			dbtest.updateDevs();
			next();
		});
	});
	Devices.schema.pre('remove', function (next) {
		sender.deleteDevice(this.fhirId).then(next());
	});
	Devices.defaultColumns = 'title, SerConn, MessageDefinition';
	Devices.register();