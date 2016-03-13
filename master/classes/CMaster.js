'use strict';

var os = require('os');
var CCluster = require('./CCluster');
var readline = require('readline');
var EE = new (require('events')).EventEmitter();

class CMaster {
    constructor() {
        this.Cluster = CCluster.getInstance();
        this.coresNumber = os.cpus().length;
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
            console.log(`worker #${worker.id} is online`);
            ++workerCount == this.coresNumber && EE.emit('workersReady');
        });

        this.Cluster.addListener('exit', (worker, code, signal) => {
            console.log(`worker #${worker.id} died with code #${code} and signal #${signal}`);
            console.log('Is restarting...');
            //this.Cluster.fork();
        });

        EE.once('workersReady', this.startRead);
    }

    fork(quantity) {
        this.coresNumber = 1 || this.coresNumber;

        this.Cluster.setupMaster({silent: true});
        _.forEach(new Array(this.coresNumber), () => {
            this.Cluster.fork()
        });
    }

    startRead() {
        console.log('Start reading');
    }
}


module.exports = CMaster;