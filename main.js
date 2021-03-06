const  bodyParser = require('body-parser');
const express = require('express');

const {Block, generateNextBlock, getBlockchain, getLatestBlock} = require('./src/chain');
const {connectToPeers, getSockets, initPeerServer, broadcastLatest} = require('./src/net');

const httpPort = process.env.HTTP_PORT || 3001;
const netPort = process.env.NET_PORT || 6001;

const initHttpServer = ( myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/', (req,res) => {
        res.redirect(301, '/interface',)
    });

    app.get('/blocks', (req, res) => {
        res.send(getBlockchain());
    });
    app.post('/mineBlock', (req, res) => {
        if(generateNextBlock(req.body.data)) {
            broadcastLatest(); 
            res.send(getLatestBlock());
        }
    });
    app.get('/peers', (req, res) => {
        res.send(getSockets().map(( s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers(req.body.data)
        res.send("Trying to add peer");
    });

    app.get("/interface", (req, res) => {
        res.sendFile(__dirname + "/public/interface.html")
    })

    app.get("/display", (req, res) => {
        res.sendFile(__dirname + "/public/display.html")
    })

    app.use("/static", express.static(__dirname + '/public'))

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
initPeerServer(netPort);
