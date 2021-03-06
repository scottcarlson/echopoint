
var url = require('url'),
		//Log = require('./logger').getInstance().getLogger(),
		Model = Model || Object;

exports.productionModeActive = false;

// google uses a timestamp hash to verify calls to it's ajax loadreview url
// this must be updated manually AT LEAST once every 24 hours (more if possible)
// to get this you must look at request headers from a legit browser request on a business locals page
// after load more review has been clicked
exports.googleTimestampHash = 'AObGSAgWyxRM6gxFFhdc0Qf0_5rzQRjpcg:1387572894111' 

// this is for Angular JS bootstraped pages
exports.bootstrapRoute = 'bootstrap';

// http request error codes for retry attempts
exports.retryErrorCodes = ['ENETUNREACH', 'ETIMEDOUT', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ECONNRESET'];

exports.getUser = function(id, callback) {
	Model.User.findById(id, function(err, user) {
		// log any errors at the callback so we gatehr file and line data
		callback(err, user);
	});
} 		

exports.getBusiness = function(user_id, business_id, lean, callback) {
	if(typeof lean === 'function') {
		callback = lean;
		lean = false;
	}

	Model.User.find({_id: user_id, Business: {$exists: true}}, {'Business': {$elemMatch: {'_id': business_id}}}, {lean: lean}, function(err, business) {
		callback(err, business);
	})
}

exports.getBusinessByName = function(user_id, business_name, lean, callback) {
	if(typeof lean === 'function') {
		callback = lean;
		lean = false;
	}

	Model.User.find({_id: user_id, Business: {$exists: true}}, {'Business': {$elemMatch: {'name': business_name}}}, {lean: lean}, function(err, business) {
		callback(err, business);
	})
}

exports.getBusinessIndex = function(user_id, business_id, callback) {
	Model.User.findById(user_id, function(err, user) {
		if(err)
			return callback(err)

		for(var i=0, l=user.Business.length;i<l;i++) {
			var index = i;
			if(user.Business[i]._id.toString() === business_id.toString())
				return callback(err, user, index);
		}

		callback('No matching business')
	})
}

// this is not used and probably not needed
exports.engagersImport = function(network, engagers, callback) {

	var networkKey = network + '_id',
			queryObject = {},
			queryArray = [];

	for(var i = 0, l = engagers.length; i<l; i++) {
		queryObject[networkKey] = engagers[i][networkKey];
		queryArray.push(queryObject);
	}

	Model.Engagers.find({$or: queryArray}, function(err, matched) {

		if(!matched || !matched.length) {
			engagersCollectionInsert(engagers)
		} else {
			for(var x = 0, l = matched.length; x<l; x++) {
				for(var y = 0, len = matched.length; y<len; y++) {

				}
			}
		}

	})

	function engagersCollectionInsert(documents) {

	}
} 		

// great object sorting function found at http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects#answer-979325
// working jsfiddle version: http://jsfiddle.net/dFNva/1/
exports.sortBy = function(field, reverse, primer) {
	var key = function (x) {
		return primer ? primer(x[field]) : x[field]
	};

	return function (a,b) {
		var A = key(a), B = key(b);
		return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];                  
	}
};

exports.timestamp = function(date, seconds) {
	if(!seconds && typeof date !== 'string') {
		seconds = date;
		date = false;
	}

	var timestamp = date ? new Date(date).getTime() : Date.now();
	if(seconds)
		return timestamp
	else
		return Math.round(timestamp/1000)
}

exports.redirectToPrevious = function(session) {
	return (typeof session.returnTo !== 'undefined' && session.returnTo) ? session.returnTo : '/dashboard';
}

exports.isPath = function(currentUrl, bypassPaths, bypassPathKeywords) {
	var urlsToBypass = bypassPaths || ['/login', '/logout', '/business/select', '/business/create'],
			pathKeywordsToBypass = bypassPathKeywords || ['/oauth/', '/partials/'],
			path = url.parse(currentUrl).pathname;

	for(var i = 0, l = urlsToBypass.length; i < l; i++) {
		if(path == urlsToBypass[i] || path == (urlsToBypass[i] + '/'))
			return true;
	}

	for(var i = 0, l = pathKeywordsToBypass.length; i < l; i++) {
		if(~currentUrl.indexOf(pathKeywordsToBypass[i]))
			return true;
	}

	return false;
}

exports.randomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

exports.stack = function(){
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack){ return stack }
  var err = new Error;
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}