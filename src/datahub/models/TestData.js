var keystone = require('keystone');
var Types = keystone.Field.Types;
 var dbtest = require('../../extract/dbtest.js');

// var TestData = keystone.List();

// TestData.add({
	// TestName : String,
	// TestDateTime: { type: Date, default: Date.now },
	// PersonId: String,
// });
// TestData.Schema.add({
	// Vals:{
		// values: [{a
			// Name: String,
			// Value: Number,
			// Unit: String
		// }]
	// }
// });
 
// TestData.register();

// var keystone = require('keystone');
// var Types = keystone.Field.Types;

var TestData = new keystone.List('TestData', {
  autokey: { path: 'slug', from: 'TestName', unique: false },
  map: { name: 'TestName' },
  defaultSort: '-TestDateTime',
  nocreate: true, watch:true
});

TestData.add({
  TestName : { type: String, noedit: true },
  TestDateTime: { type: Date, default: Date.now, noedit: true },
  PersonId:{type:Number},
  Device: { type: Types.Relationship, ref: 'Devices', noedit: true }//,
  // Vals: {type: Types.Text, watch: true, value: function (cb) {
	  // console.log(this.Vals);
	  
	 // return "test";	  
  // }}
});

// var archive = function(next) {
    // this.state = 'archived';
    // this.save(function(err) {
        // if (!err) {
            // next(err, 'Post is archived');
        // } else {
            // next(err, 'Archiving failed');
        // }
    // });
// }

TestData.schema.pre('save', function (next) {
	
  
  let event = this;
  if (event.isModified('published') && event.published) {
    this.publishDate = Date.now();
  }
  console.log("pre");
  
  //this.remove();
  next();
});

TestData.schema.post('save', function (next) {
	//var obj = this;
	
	console.log('====================');
	dbtest.sendToFhir(this._id,this, function(out,passable){
		console.log("/////////////// AFTERSEND TO FHIR ///////////////" + out); 
		if(out != null){
			passable.remove();
		}
	});
	

});

TestData.defaultColumns = 'TestName, Device, TestDateTime'
TestData.register();