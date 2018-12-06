var keystone = require('keystone');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var await = require("await");
//Database connection 

async function getData(res){
	
	let Devices = mongoose.model('Devices');
	let Tests = mongoose.model('TestData');
	let result = await Devices.find({});
	var rw=[]
	for(var y=0; y<result.length; y++){
		let rs = await Tests.find({"Device":result[y]._id}).count();
		rw.push({x: result[y].title , value:rs ,normal:{fill: '#3A4A9A', stroke:"#3A4A9A"}});
	}
	res.send(rw);
};
exports = module.exports = function (req, res) {
	getData(res);		
}


