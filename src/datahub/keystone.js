// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();
var dbtest = require('../extract/dbtest.js');
// Require keystone
var keystone = require('keystone');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
	'name': 'DataHub',
	'brand': 'DataHub',

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.png',
	
	'views': 'templates/views',
	'view engine': 'pug',

	'emails': 'templates/emails', 

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',
	'wysiwyg additional plugins': 'example, table, advlist, anchor,'
   + ' autolink, autosave, bbcode, charmap, contextmenu, '
   + ' directionality, emoticons, fullpage, hr, media, pagebreak,'
   + ' paste, preview, print, searchreplace, textcolor,'
   + ' visualblocks, visualchars, wordcount',
});

// Load your project's Models
keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('lodash'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable,
});

// Load your project's Routes
keystone.set('routes', require('./routes'));

keystone.set('delete redirect', '/whatever/url/you/want');
// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	users: 'users',
	testdata: 'TestData',
	devices:'Devices'
});

// Start Keystone to connect to your database and initialise the web server


if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
	console.log('----------------------------------------'
	+ '\nWARNING: MISSING MAILGUN CREDENTIALS'
	+ '\n----------------------------------------'
	+ '\nYou have opted into email sending but have not provided'
	+ '\nmailgun credentials. Attempts to send will fail.'
	+ '\n\nCreate a mailgun account and add the credentials to the .env file to'
	+ '\nset up your mailgun integration');
}


keystone.start();
