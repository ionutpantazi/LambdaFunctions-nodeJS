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

    if (event.queryStringParameters) {
        if (event.queryStringParameters.param && event.queryStringParameters.param == 'save') {
            const write = {
                TableName: 'db-table',
                Item: {
                    "id": JSON.parse(event.body).id,
                    "geometry": JSON.parse(event.body).geometry,
                    "properties": JSON.parse(event.body).properties,
                    "type": JSON.parse(event.body).type
                }
            };
            docClient.put(write, function(err, data) {
                if (err) {
                    callback(err, CORS("error on save method"));
                    console.log('error3');
                }
                else {
                    console.log('DB saved');
                    callback(null, CORS('id ' + JSON.parse(event.body).id + ' saved'));
                }
            });
        }
        if (event.queryStringParameters.param && event.queryStringParameters.param == 'scan') {
            const scan = {
                TableName: 'db-table'
            };
            docClient.scan(scan, function(err, data) {
                if (err) {
                    console.log('error on scan method');
                    callback(err, CORS("error on scan method"));
                }
                else {
                    callback(null, CORS(data));
                }
            });
        }
        if (event.queryStringParameters.id) {
            const read = {
                TableName: 'db-table',
                Key: {
                    "id": event.queryStringParameters.id
                }
            };
            docClient.get(read, function(err, data) {
                if (err) {
                    console.log('error on read method');
                    callback(err, CORS("error on read method"));
                }
                else {
                    callback(null, CORS(data));
                }
            });
        }
    }
    else {
        callback(null, CORS("no params found"));
    }
};
