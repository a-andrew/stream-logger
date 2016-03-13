'use strict';

var CCluster = require('./CCluster');

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

    introducing() {
        console.log(`Hello I\'m a worker #${this.Cluster.worker().id}`);
        console.log(`Process ID #${this.Cluster.worker().process.pid}`);
    }
}

module.exports = CWorker;