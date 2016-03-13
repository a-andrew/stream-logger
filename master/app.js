'use strict';

/******************************************************/
global._ = require('lodash');
/******************************************************/
var Cluster = require('./classes/CCluster').getInstance();
var Master = require('./classes/CMaster').getInstance();
var Worker = require('./classes/CWorker').getInstance();
/******************************************************/

if (Cluster.isMaster) {
    Master.addListeners();
    Master.fork();
}
else if (Cluster.isWorker) {
    Worker.introducing();
}