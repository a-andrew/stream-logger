'use strict';

var os = require('os');
var CCluster = require('./CCluster');
var readline = require('readline');
var Readable = require('stream').Readable;
var randomstring = require("randomstring");
var fs = require('fs');
var EE = new (require('events')).EventEmitter();
require('colors');

class CMaster {
    constructor() {
        this.Cluster = CCluster.getInstance();
        this.workersCount = os.cpus().length;
        this.inputFilePath = './master/inputs/logs.log';
        this.STBridges = [];
    }

    static getInstance() {
        if (!(this.instance instanceof CMaster)) {
            this.instance = new CMaster()
        }
        return this.instance;
    }

    addListeners() {
        let workerNumber = 0;
        this.Cluster.addListener('online', (worker) => {
            console.log(`worker #${worker.id} is online`.rainbow);

            this.initWorker(worker);

            !(this.workersCount - ++workerNumber) && EE.emit('workersReady');
        });

        this.Cluster.addListener('exit', (worker, code, signal) => {
            if (!worker.suicide) {
                console.log(`worker #${worker.id} died with code #${code} and signal #${signal}`.red.bold);
                console.log('Is restarting...');
                this.Cluster.fork();
            }

            !this.Cluster.workersCount && (process.exit());
        });

        EE.once('workersReady', _.partialRight(this.startRead, this));
        //EE.once('workersReady', _.partialRight(this.startReadForeve, this));
    }

    initWorker(worker) {
        worker.on('message', (message) => {
            console.log('Worker count when killing ' + this.Cluster.workersCount);
            message == 'done' && worker.kill();
        });

        this.createReadStream(worker);
    }

    createReadStream(worker) {
        let stream = new Readable();
        stream._read = _.noop;
        stream.pipe(worker.process.stdin);
        this.STBridges.push(stream);
    }

    fork(quantity) {
        this.workersCount = quantity || this.workersCount;
        this.Cluster.setupMaster({
            silent: true
        });

        _.forEach(new Array(this.workersCount), () => {
            this.Cluster.fork()
        });
    }

    startRead(self) {
        console.time(`Parsing file #${self.inputFilePath}`.blue.bold);
        self.reader = readline.createInterface({
            input: fs.createReadStream(self.inputFilePath),
            output: process.stdout,
            terminal: false
        });

        let streamNumber = 0;
        self.reader.on('line', (line) => {
            self.STBridges[streamNumber++].push(`${line}\n`);
            !(self.Cluster.workersCount - streamNumber) && (streamNumber = 0);
        });

        self.reader.on('close', () => {
            console.log('File ended'.blue);
            self.ENDBroadcast();
            console.timeEnd(`Parsing file #${self.inputFilePath}`.blue.bold);
        });

        self.reader.on('error', (e) => {
            console.log(`Error: ${e}`.red);
        });
    }

    startReadForeve(self) {
        let streamNumber = 0;
        while (1) {
            console.log(randomstring.generate(7));
            /*self.STBridges[streamNumber++].push(randomstring.generate(7) + '\n');
            !(self.Cluster.workersCount - streamNumber) && (streamNumber = 0);*/
        }
    }

    ENDBroadcast() {
        _.forEach(this.STBridges, (bridge) => {
            bridge.push(null);
        });
    }
}

module.exports = CMaster;