const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });
const s3 = new AWS.S3({ region: "us-east-1" });

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
    if (event.body) {
        let body = JSON.parse(event.body);
        let id = body.id;
        let password = body.password;

        const read = {
            TableName: 'downloadAPI',
            Key: {
                "path": password //replace path
            }
        };
        docClient.get(read, function(err, data) {
            if (err) {
                callback(null, CORS({ status: "error", message: "error on get method" }));
            }
            else {
                if (data.Item) {
                    let remaining = data.Item.remaining;
                    if (remaining > 0) {
                        const write = {
                            TableName: 'downloadAPI',
                            Key: {
                                "path": password, //replace path
                            },
                            UpdateExpression: "set remaining = :left",
                            ExpressionAttributeValues: {
                                ":left": remaining - 1
                            },
                            ReturnValues: "UPDATED_NEW"
                        };
                        docClient.update(write, function(err, data) {
                            if (err) {
                                callback(null, CORS({ status: "error", message: "error on update method" }));
                            }
                            else {
                                const url = s3.getSignedUrl('getObject', {
                                    Bucket: 'lombard-database',
                                    Key: "docs/" + id,
                                    Expires: 10
                                });
                                callback(null, CORS({ status: "ok", message: remaining - 1 + " downloads remaining", download: url }));
                            }
                        });
                    }
                    else {
                        callback(null, CORS({ status: "error", message: "password expired" }));
                    }
                }
                else {
                    callback(null, CORS({ status: "error", message: "password incorrect" }));
                }
            }
        });
    }
    else {
        callback(null, CORS({ status: "error", message: "event.body missing" }));
    }
};
