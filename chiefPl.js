'use strict'

var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();

exports.doIt = function(event, context, callback) {
  const click = {clickTime: new Date()};
  var params = {
    FunctionName: 'aws-lambda-connect-mongo-pool-worker-dev-work',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(click)
  };

  lambda.invoke(params, function(err, data) {
    if (err) {
      context.fail(err);
    } else {
      const _200 = {
				statusCode: 200,
				body: JSON.stringify(
				  {
					message: 'PL - aws-lambda-connect-mongo-pool-worker-dev-work said ' + data.Payload,
					input: event,
				  },
				  null,
				  2
				),
			  };
			
			callback(null, _200);
    }
  })
};