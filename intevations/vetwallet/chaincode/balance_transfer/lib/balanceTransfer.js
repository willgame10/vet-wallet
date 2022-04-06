'use strict';

const { Contract } = require('fabric-contract-api');

const accountObjType = "Account";

class BalanceTransfer extends Contract {

    async initAccount(ctx, id, balance) {
        if (!ctx.clientIdentity.assertAttributeValue("init", "true")) {
            throw new Error(`you don't have permissions to initialize an account`);
        }

        const accountBalance = parseFloat(balance);
        if (accountBalance < 0) {
            throw new Error(`account balance cannot be negative`);
        }

        const account = {
            id: id,
            owner: this._getTxCreatorUID(ctx),
            balance: accountBalance
        }

        if (await this._accountExists(ctx, account.id)) {
            throw new Error(`the account ${account.id} already exists`);
        }

        await this._putAccount(ctx, account);
    }

    async setBalance(ctx, id, newBalance) {
        const newAccountBalance = parseFloat(newBalance);
        if (newAccountBalance < 0) {
            throw new Error(`account balance cannot be set to a negative value`);
        }

        let account = await this._getAccount(ctx, id);

        const txCreator = this._getTxCreatorUID(ctx);
        if (account.owner !== txCreator) {
            throw new Error(`unauthorized access: you can't change account that doesn't belong to you`);
        }

        account.balance = newAccountBalance;
        await this._putAccount(ctx, account);
    }

    async transfer(ctx, idFrom, idTo, amount) {
        const amountToTransfer = parseFloat(amount);
        if (amountToTransfer <= 0) {
            throw new Error(`amount to transfer cannot be negative`);
        }

        let accountFrom = await this._getAccount(ctx, idFrom);

        const txCreator = this._getTxCreatorUID(ctx);
        if (accountFrom.owner !== txCreator) {
            throw new Error(`unauthorized access: you can't change account that doesn't belong to you`);
        }

        let accountTo = await this._getAccount(ctx, idTo);

        if (accountFrom.balance < amountToTransfer) {
            throw new Error(`amount to transfer cannot be more than the current account balance`);
        }

        accountFrom.balance -= amountToTransfer
        accountTo.balance += amountToTransfer

        await this._putAccount(ctx, accountFrom);
        await this._putAccount(ctx, accountTo);
    }

    async listAccounts(ctx) {
        const txCreator = this._getTxCreatorUID(ctx);

        const iteratorPromise = ctx.stub.getStateByPartialCompositeKey(accountObjType, []);

        let results = [];
        for await (const res of iteratorPromise) {
            const account = JSON.parse(res.value.toString());
            if (account.owner === txCreator) {
                results.push(account);
            }
        }

        return JSON.stringify(results);
    }

    _getTxCreatorUID(ctx) {
        return JSON.stringify({
            mspid: ctx.clientIdentity.getMSPID(),
            id: ctx.clientIdentity.getID()
        });
    }

    async _accountExists(ctx, id) {
        const compositeKey = ctx.stub.createCompositeKey(accountObjType, [id]);
        const accountBytes = await ctx.stub.getState(compositeKey);
        return accountBytes && accountBytes.length > 0;
    }

    async _getAccount(ctx, id) {
        const compositeKey = ctx.stub.createCompositeKey(accountObjType, [id]);

        const accountBytes = await ctx.stub.getState(compositeKey);
        if (!accountBytes || accountBytes.length === 0) {
            throw new Error(`the account ${id} does not exist`);
        }

        return JSON.parse(accountBytes.toString());
    }

    async _putAccount(ctx, account) {
        const compositeKey = ctx.stub.createCompositeKey(accountObjType, [account.id]);
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(account)));
    }
}

module.exports = BalanceTransfer;