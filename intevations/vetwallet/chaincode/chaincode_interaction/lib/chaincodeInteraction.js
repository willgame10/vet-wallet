'use strict';

const { Contract } = require('fabric-contract-api');

class ChaincodeInteractionContract extends Contract {

    async put(ctx, key, value) {
        await ctx.stub.putState(key, Buffer.from(value));
    }
    
    async get(ctx, key) {
        const value = await ctx.stub.getState(key);
        if (!value || value.length === 0) {
            throw new Error(`The asset ${key} does not exist`);
        }

        return value.toString();
    }

    async invokeChaincode(ctx, channel, chaincode, argsString) {
        const args = JSON.parse(argsString);
        const chaincodeResponse = await ctx.stub.invokeChaincode(chaincode, args, channel);
        if (chaincodeResponse.status >= 400) {
            throw new Error(`Chaincode ${chaincode} from channel ${channel} returned ${chaincodeResponse.status} status code: ${chaincodeResponse.message}`);
        }

        return chaincodeResponse.payload;
    }

}

module.exports = ChaincodeInteractionContract;