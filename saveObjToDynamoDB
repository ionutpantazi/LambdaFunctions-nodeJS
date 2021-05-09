const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

function CORS(param) {
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(param),
    };
    return response;
}

exports.handler = (event, context, callback) => {

    if (event.queryStringParameters.param && event.queryStringParameters.param == 'save') {
        const write = {
            TableName: 'db-table',
            Key: {
                "id": event.queryStringParameters.path,
                //"data": JSON.parse(event.body).database,
                //"path": JSON.parse(event.body).path
            },
            UpdateExpression: "set #data = :obj",
            ExpressionAttributeNames: {
                "#data": "data"
            },
            ExpressionAttributeValues: {
                ":obj": JSON.parse(event.body).database.features
            },
        };
        docClient.update(write, function(err, data) {
            if (err) {
                callback(err, CORS("error3"));
                console.log('error3');
            }
            else {
                console.log('DB saved');
                callback(null, CORS('DB saved on path: ' + event.queryStringParameters.path));
            }
        });
    }
    else {
        const read = {
            TableName: 'db-table',
            FilterExpression: 'id = :path',
            ExpressionAttributeValues: { ':path': event.queryStringParameters.path }
        };
        docClient.scan(read, function(err, data) {
            if (err) {
                console.log('error on scan method');
                callback(err, CORS("error on scan method"));
            }
            else {
                console.log('OK');
                callback(null, CORS(data));
            }
        });
    }
};
