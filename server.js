'use strict';
var
    express = require('express'),
    url = require('url'),
    app = express(),
    bodyParser = require('body-parser'),
    request = require('request'),
    _$ = require('cheerio'),
    server;

function getWebsite(website, cb) {

    request(website, function(err, msg, resp) {
        var
            images,
            links,
            imgs = [],
            lnks = [],
            body;

        if ( !err ) {

            body = _$('body', resp);
            images = body.find('img');
            links = body.find('a').filter(function(ix, el) {
                var
                    src = _$(el).attr('href'),
                    skip = true;

                if ( src ) {

                    skip = src.indexOf('#') === 0;
                }

                return !skip;
            });

            images.each(function(ix, el) {
                imgs.push(_$(el).attr('src'));
            });

            links.each(function(ix, el) {
                lnks.push(_$(el).attr('href'));
            });

            cb( {
                images: imgs,
                links: lnks,
                base: website
            });

        } else {
            console.log('bad response: ' + website);
            cb();
        }
    });
}


function getImages (req0, res0) {
    var
        website = req0.param('website'),
        filterImg = {},
        filterLin = {},
        countLin = 0,
        countLinTotal = 0,
        countThreshold = 50,
        countImg = 0,
        buffer = [];

    function cb(results) {
        var
            images,
            links;

        countLin += 1;
        if ( results ) {

            images = results.images;
            links = results.links;

            images.forEach(function(el) {
                var
                    img = url.resolve(website, el);

                if ( filterImg[img] ) {
                    filterImg[img] += 1;
                } else {
                    filterImg[img] = 1;
                    countImg += 1;
                    buffer.push(img);
                }
            });

            links.forEach(function(el) {
                var
                    link = url.resolve(website, el);

                if ( link.indexOf(website) === 0  ) {

                    if ( filterLin[link] ) {
                        filterLin[link] += 1;
                    } else {
                        filterLin[link] = 1;
                        countLinTotal += 1;


                        getWebsite(link, cb);
                    }
                }
            });
        }

        if ( countLin % countThreshold === 0 && buffer.length ) {

            console.log(countLin + ' from: ' + countLinTotal);
            res0.write('data:' + JSON.stringify(buffer) + '\n\n');
            buffer = [];
        }

        if ( countLin >= countLinTotal ) {

            buffer = '';
            filterLin = '';
            filterImg = '';
            console.log('That\'s all folks! \n' + countImg + ' - total unique images has been found.');
            res0.end();
        }

    }

    if (website) {

        req0.socket.setTimeout(Infinity);

        res0.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res0.write('\n');

        filterLin[website] = 1;
        countLinTotal += 1;
        getWebsite(website, cb);

    } else {

        res0.send({
            "resp": "no website name provided"
        });
        res0.end();
    }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/build'));

app.get('/getimages', function(req, res) {

    console.log('incomming request');
    getImages(req, res);
});

server = app.listen(process.env.PORT || 3000, process.env.IP || "localhost", function() {
    var
        host = server.address().address,
        port = server.address().port;

    console.log('Image Crawler started at http://%s:%s', host, port);
});
