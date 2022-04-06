'use strict';

const chaincodeInteractionContract = require('./lib/chaincodeInteraction');

module.exports.ChaincodeInteractionContract = chaincodeInteractionContract;
module.exports.contracts = [chaincodeInteractionContract];