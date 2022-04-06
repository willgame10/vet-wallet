'use strict';

const { Contract } = require('fabric-contract-api');

class PolicyContract extends Contract {

    async put(ctx, key, value, ep) {
        // ep is expected to be a signature policy, e.g. "AND('Org1MSP.member', 'Org2MSP.member')"
        if (ep && ep !== "") {
            await ctx.stub.setStateValidationParameter(key, Buffer.from(ep));
        }
        await ctx.stub.putState(key, Buffer.from(value));
    }
    
    async get(ctx, key) {
        console.log((await ctx.stub.getStateValidationParameter(key)).toString());

        const value = await ctx.stub.getState(key);
        if (!value || value.length === 0) {
            throw new Error(`The asset ${key} does not exist`);
        }

        return value.toString();
    }

}

module.exports = PolicyContract;