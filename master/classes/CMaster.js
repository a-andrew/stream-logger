'use strict';

var os = require('os');
var readline = require('readline');
var EE = new (require('events')).EventEmitter();

class CMaster {
    constructor() {
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
        cluster.on('online', (worker) => {
            console.log(`worker #${worker.id} is online`);
            ++workerCount == this.coresNumber && EE.emit('workersReady');
        });

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker #${worker.id} died with code #${code} and signal #${signal}`);
            console.log('Is restarting...');
            cluster.fork();
        });

        EE.once('workersReady', this.startRead);
    }

    fork(quantity) {
        this.coresNumber = quantity || this.coresNumber;
        _.forEach(new Array(this.coresNumber), () => {
            cluster.fork()
        });
    }

    startRead(){
        console.log('Start reading');
    }
}


module.exports = CMaster;