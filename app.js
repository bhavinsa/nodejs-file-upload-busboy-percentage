var Busboy = require('busboy');
var express = require('express');
var app = express();
var fs = require('fs');
var status = [];
var progress = [];
var total = []

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/filechooser.html');
})

app.get('/checkstatus/:id', (req, res) => {
    let result = (status[req.params.id] != undefined ? status[req.params.id] : '0')
    res.send(result.toString());
    return;
})

app.post('/', (req, res) => {

    if (req.method === 'POST') {
        // console.log(JSON.stringify(req.headers));
        var busboy = new Busboy({ headers: req.headers });
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            var saveTo = __dirname + '/uploads/' + Math.random() + filename;
            file.pipe(fs.createWriteStream(saveTo));
            total[fieldname] = req.headers['content-length'];

            file.on('data', function (data) {
                if (progress[fieldname] == undefined) {
                    progress[fieldname] = 0;
                }
                progress[fieldname] = progress[fieldname] + data.length;
                var perc = parseInt((progress[fieldname] / total[fieldname]) * 100);
                console.log('percent complete: ' + perc + '%\n');
                status[fieldname] = perc;

                if (status[fieldname] >= 99) {
                    delete status[fieldname];
                    delete progress[filename];
                    delete total[filename]
                }
                // console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            })

        });

        busboy.on('finish', function () {
            res.writeHead(303, { Connection: 'close', Location: '/' });
            res.end("That's all folks!");
        });
        return req.pipe(busboy);
    }
    res.writeHead(404);
    res.end();
})

app.listen(1000, function () {
    console.log('Listening for requests');
});