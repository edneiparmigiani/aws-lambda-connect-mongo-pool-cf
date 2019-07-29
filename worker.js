'use strict';

var MongoClient = require('mongodb').MongoClient;

let mongoDbConnectionPool = null;
let scalegridMongoURI = null;
let scalegridMongoDbName = null;

module.exports.work = (event, context, callback) => {
	console.log('Received event:', JSON.stringify(event));
	console.log('remaining time =', context.getRemainingTimeInMillis());
	console.log('functionName =', context.functionName);
	console.log('AWSrequestID =', context.awsRequestId);
	console.log('logGroupName =', context.logGroupName);
	console.log('logStreamName =', context.logStreamName);
	console.log('clientContext =', context.clientContext);

	// This freezes node event loop when callback is invoked
	context.callbackWaitsForEmptyEventLoop = false;

	var mongoURIFromEnv = 'mongodb+srv://admin:<admin>@cluster0-gnn8n.mongodb.net';
	var mongoDbNameFromEnv = 'test';
	if (!scalegridMongoURI) {
		if (mongoURIFromEnv) {
			scalegridMongoURI = mongoURIFromEnv;
		} else {
			var errMsg = 'scalegrid mongodb cluster uri is not specified.';
			console.log(errMsg);
			var errResponse = prepareResponse(null, errMsg);
			return callback(errResponse);
		}
	}

	if (!scalegridMongoDbName) {
		if (mongoDbNameFromEnv) {
			scalegridMongoDbName = mongoDbNameFromEnv;
		} else {
			var errMsg = 'scalegrid mongodb name not specified.';
			console.log(errMsg);
			var errResponse = prepareResponse(null, errMsg);
			return callback(errResponse);
		}
	}

	getMongoDbConnection(scalegridMongoURI)
		.then(dbConn => {
			console.log(':::create new click.');
			insertClick(dbConn, context);
			const _200 = {
				statusCode: 200,
				body: JSON.stringify(
				  {
					message: 'sucess',
					input: event,
				  },
				  null,
				  2
				),
			  };
			
			  callback(null, _200);
		})
		.catch(err => {
			console.log('an error occurred: ', err);
			const _500 = {
				statusCode: 500,
				body: JSON.stringify(
				  {
					message: 'error',
					input: event,
				  },
				  null,
				  2
				),
			  };
			
			  callback(null, _500);
		});
};

function getMongoDbConnection(uri) {
	if (mongoDbConnectionPool && mongoDbConnectionPool.isConnected(scalegridMongoDbName)) {
		console.log(':::reusing the connection from pool');
		return Promise.resolve(mongoDbConnectionPool.db(scalegridMongoDbName));
	}

	console.log(':::init the new connection pool');
	return MongoClient.connect(uri, {
		poolSize: 10
	}).then(dbConnPool => {
		mongoDbConnectionPool = dbConnPool;
		return mongoDbConnectionPool.db(scalegridMongoDbName);
	});
}

function insertClick(dbConn, context) {
	const click = { clickTime: new Date() };
	return dbConn.collection('clicks').save(click, (err, result) => {
		if (err) {
			return false;
		}
		return true;
	});
}