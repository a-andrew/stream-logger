'use strict';

class CCluster {
    constructor() {
        this.instance = require('cluster');
    }

    static getInstance() {
        if (!(this.instance instanceof CCluster)) {
            this.instance = new CCluster()
        }
        return this.instance;
    }

    isMaster(){
        return this.instance.isMaster;
    }

    isWorker(){
        return this.instance.isWorker;
    }

    addListener(type, handler){
        if(typeof type !== 'string'){
            return new Error('Parameter "type" have to be "string');
        }

        if(typeof handler !== 'function'){
            return new Error('Parameter "handler" have to be a function');
        }

        this.instance.on(type, handler);
    }

    setupMaster(opts){
        this.instance.setupMaster(opts);
    }

    fork(){
        this.instance.fork();
    }

    get worker(){
        return this.instance.worker;
    }

    get workers(){
        return this.instance.workers;
    }

    get workersCount(){
        return _.keys(this.instance.workers).length;
    }
}

module.exports = CCluster;