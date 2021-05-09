const AWS = require('aws-sdk');
var s3 = new AWS.S3({ region: "us-east-1" });

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
    
    var FILE_NAME = 'database/';
    var IMAGE_DATA = '';
    
    if (event.body) {
        let body = JSON.parse(event.body);
        var base64 = body.database;
        FILE_NAME = body.path+'.json';
        IMAGE_DATA = JSON.stringify(base64);
    }
    
    const params = {
        Bucket: 'lombard-database',
        Key: FILE_NAME,
        Body: IMAGE_DATA
    };

    const url = s3.getSignedUrl('getObject', {
        Bucket: 'lombard-database',
        Key: FILE_NAME
    }).split('?')[0];

    s3.upload(params, function(err, data) {
        if (err) {
            callback(err, CORS('error + err'));
        }
        callback(null, CORS(url));
    });
};
