'use strict';

var os = require('os');

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
        cluster.on('online', (worker) => {
            console.log(`worker #${worker.id} is online`);
        });

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker #${worker.id} died with code #${code} and signal #${signal}`);
            console.log('Is restarting...');
            cluster.fork();
        });
    }

    fork(quantity) {
        quantity = quantity || this.coresNumber;
        _.forEach([quantity], () => {
            cluster.fork()
        });
    }
}


module.exports = CMaster;