'use strict';

var os = require('os');
var CCluster = require('./CCluster');
var readline = require('readline');
var Readable = require('stream').Readable;
var fs = require('fs');
var EE = new (require('events')).EventEmitter();
require('colors');

class CMaster {
    constructor() {
        this.Cluster = CCluster.getInstance();
        this.coresNumber = os.cpus().length;
        this.inputFilePath = './master/inputs/logs.log';
        this.streams = [];
    }

    static getInstance() {
        if (!(this.instance instanceof CMaster)) {
            this.instance = new CMaster()
        }
        return this.instance;
    }

    addListeners() {
        let workerCount = 0;

        this.Cluster.addListener('online', (worker) => {
            console.log(`worker #${worker.id} is online`.rainbow);

            worker.on('message', (message) => {
                if (message == 'done') {
                    worker.kill();
                    --workerCount;
                }

                !workerCount && console.log('Workers are done');
            });
            this.createReadStream(worker);
            ++workerCount == this.coresNumber && EE.emit('workersReady');
        });

        this.Cluster.addListener('exit', (worker, code, signal) => {
            console.log(`worker #${worker.id} died with code #${code} and signal #${signal}`);
            console.log('Is restarting...');
            this.Cluster.fork();
        });

        EE.once('workersReady', _.partialRight(this.startRead, this));
    }

    createReadStream(worker) {
        let stream = new Readable();
        stream._read = _.noop;
        stream.pipe(worker.process.stdin);
        this.streams.push(stream);
    }

    fork(quantity) {
        this.coresNumber = quantity || this.coresNumber;
        this.Cluster.setupMaster({
            silent: true
        });

        _.forEach(new Array(this.coresNumber), () => {
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
            self.streams[streamNumber].push(`${line}\n`);
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

    ENDBroadcast() {
        _.forEach(this.streams, (stream) => {
            stream.push(null);
        });
    }
}

module.exports = CMaster;