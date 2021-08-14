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
            const db = JSON.parse(event.body);
            console.log(db.db.features.length);
            const items = db.db.features;
            let saved = [];
            let deleted = [];
            items.forEach((item) => {
                if (item.length > 1) {
                    if (item[0] == '+') {
                        saved.push(item[1].id);
                        const params = {
                            TableName: 'db-table',
                            Item: {
                                "id": item[1].id,
                                "geometry": item[1].geometry,
                                "properties": item[1].properties,
                                "type": item[1].type
                            }
                        };
                        docClient.put(params, function(err, data) {
                            if (err) {
                                callback(err, CORS("error on save method"));
                                console.log('error3');
                            }
                            else {
                                saved.push(item[1].id);
                            }
                        });
                    }
                    else if (item[0] == '-') {
                        deleted.push(item[1].id);
                        const params = {
                            TableName: 'db-table',
                            Key: {
                                "id": item[1].id
                            }
                        };
                        docClient.delete(params, function(err, data) {
                            if (err) {
                                callback(err, CORS("error on delete method"));
                                console.log('error3.1');
                            }
                            else {
                                deleted.push(item[1].id);
                            }
                        });
                    }
                    else {
                        callback(null, CORS('no action taken'));
                    }

                }
            });
            callback(null, CORS('saved: ' + JSON.stringify(saved) + ' deleted: ' + JSON.stringify(deleted)));

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
