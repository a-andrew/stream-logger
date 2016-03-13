'use strict';

/******************************************************/
global._ = require('lodash');
global.cluster = require('cluster');
/******************************************************/
var Master = require('./classes/CMaster').getInstance();
var Worker = require('./classes/CWorker').getInstance();
/******************************************************/

if (cluster.isMaster) {
    Master.addListeners();
    Master.fork();
}
else if (cluster.isWorker) {
    Worker.introducing();
}