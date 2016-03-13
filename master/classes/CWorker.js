'use strict';

class CWorker {
    constructor() {
    }

    static getInstance() {
        if (!(this.instance instanceof CWorker)) {
            this.instance = new CWorker()
        }
        return this.instance;
    }

    introducing() {
        console.log(`Hello I\'m a worker #${cluster.worker.id}`);
        console.log(`Process ID #${cluster.worker.process.pid}`);
    }
}

module.exports = CWorker;