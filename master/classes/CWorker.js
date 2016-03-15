'use strict';

var CCluster = require('./CCluster');
var fs = require('fs');

class CWorker {
    constructor() {
        this.Cluster = CCluster.getInstance();
    }

    static getInstance() {
        if (!(this.instance instanceof CWorker)) {
            this.instance = new CWorker()
        }
        return this.instance;
    }

    createWriteStream(processId) {
        this.writeStream = fs.createWriteStream(`./master/outputs/${processId}-logs.log`, {flaw: 'w'});
    }

    processStream() {
        this.createWriteStream(process.pid);
        process.stdin.pipe(this.writeStream);

        this.writeStream.on('finish', () => {
            process.send('done');
        });
    }

    introducing() {
        console.log(`Hello I\'m a worker #${this.Cluster.worker.id}`.green);
        console.log(`Process ID #${this.Cluster.worker.process.pid}`.green);

        process.send('done');
    }
}

module.exports = CWorker;