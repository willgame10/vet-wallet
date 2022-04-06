'use strict';

const { Contract } = require('fabric-contract-api');

const lotObjType = 'Lot';
const bidObjType = 'Bid';

const LotStatus = Object.freeze({ForSale: 1, Sold: 2, Withdrawn: 3});

const auctionParticipants = ['Org1MSP', 'Org2MSP', 'Org3MSP'];

class BlindAuction extends Contract {
    async offerForSale(ctx, lotID, lotDescription, minimalBidString) {
        const minimalBid = parseFloat(minimalBidString);
        if (minimalBid < 0) {
            throw new Error(`minimal bid cannot be negative`);
        }

        let lot = {
            id: lotID,
            description: lotDescription,
            seller: ctx.clientIdentity.getMSPID(),
            minimalBid: minimalBid,
            status: LotStatus.ForSale
        };

        if (await this._assetExists(ctx, lotObjType, lot.id)) {
            throw new Error(`the lot ${lot.id} already exists`);
        }

        await this._putAsset(ctx, lotObjType, lot);
    }

    async placeBid(ctx, lotID) {
        const lot = await this._getAsset(ctx, lotObjType, lotID);

        if (lot.status !== LotStatus.ForSale) {
            throw new Error(`bid cannot be placed for a lot that is not offered for sale`);
        }

        if (lot.seller === ctx.clientIdentity.getMSPID()) {
            throw new Error(`bid cannot be placed for your own lot`);
        }

        const transient = ctx.stub.getTransient();
        let price = parseFloat(transient.get('price').toString());
        if (price < lot.minimalBid) {
            throw new Error(`price cannot be less then the minimal bid`);
        }

        const bid = {
            id: lot.id,
            bidder: ctx.clientIdentity.getMSPID(),
            price: price
        };

        const collection = this._composeCollectionName(lot.seller, bid.bidder);
        if (await this._assetExists(ctx, bidObjType, bid.id, collection)) {
            throw new Error(`the bid ${bid.id} already exists`);
        }

        await this._putAsset(ctx, bidObjType, bid, collection);
    }

    async closeBidding(ctx, lotID) {
        const lot = await this._getAsset(ctx, lotObjType, lotID);

        let bids = await this._getBidsForLot(ctx, lot);
        if (bids.length === 0) {
            lot.status = LotStatus.Withdrawn;
        } else {
            bids.sort((bid1, bid2) => bid2.price - bid1.price);
            
            const bestBid = bids[0];
            lot.status = LotStatus.Sold;
            lot.buyer = bestBid.bidder;
            lot.hammerPrice = bestBid.price;
        }

        await this._putAsset(ctx, lotObjType, lot);
    }

    async listBids(ctx, lotID) {
        const lot = await this._getAsset(ctx, lotObjType, lotID);
        return await this._getBidsForLot(ctx, lot);
    }

    async _getBidsForLot(ctx, lot) {
        if (lot.seller !== ctx.clientIdentity.getMSPID()) {
            throw new Error(`only lot seller can list bids`);
        }

        if (lot.status !== LotStatus.ForSale) {
            throw new Error(`unable to list bids for a lot that is not offered for sale`);
        }

        let bids = [];
        for (const org of auctionParticipants) {
            if (org === lot.seller) {
                continue;
            }

            const collection = this._composeCollectionName(lot.seller, org);
            if (await this._assetExists(ctx, bidObjType, lot.id, collection)) {
                bids.push(await this._getAsset(ctx, bidObjType, lot.id, collection));
            }
        }

        return bids;
    }

    async listLotsForSale(ctx) {
        return this._listLotsWithStatus(ctx, LotStatus.ForSale);
    }

    async listSoldLots(ctx) {
        return this._listLotsWithStatus(ctx, LotStatus.Sold);
    }

    async listWithdrawnLots(ctx) {
        return this._listLotsWithStatus(ctx, LotStatus.Withdrawn);
    }

    async _listLotsWithStatus(ctx, status) {
        const iteratorPromise = ctx.stub.getStateByPartialCompositeKey(lotObjType, []);
        
        let results = [];
        for await (const res of iteratorPromise) {
            const lot = JSON.parse(res.value.toString());
            if (lot.status === status) {
                results.push(lot);
            }
        }

        return JSON.stringify(results);
    }

    async _assetExists(ctx, assetObjType, id, collection='') {
        const compositeKey = ctx.stub.createCompositeKey(assetObjType, [id]);

        let assetBytes;
        collection = collection || '';
        if (collection === '') {
            assetBytes = await ctx.stub.getState(compositeKey);
        } else {
            assetBytes = await ctx.stub.getPrivateData(collection, compositeKey);
        }
        
        return assetBytes && assetBytes.length > 0;
    }

    async _getAsset(ctx, assetObjType, id, collection='') {
        const compositeKey = ctx.stub.createCompositeKey(assetObjType, [id]);

        let assetBytes;
        collection = collection || '';
        if (collection === '') {
            assetBytes = await ctx.stub.getState(compositeKey);
        } else {
            assetBytes = await ctx.stub.getPrivateData(collection, compositeKey);
        }
        
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`the asset ${assetObjType} with ID ${id} does not exist`);
        }

        return JSON.parse(assetBytes.toString());
    }

    async _putAsset(ctx, assetObjType, asset, collection='') {
        const compositeKey = ctx.stub.createCompositeKey(assetObjType, [asset.id]);
        
        collection = collection || '';
        if (collection === '') {
            await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(asset)));
        } else {
            await ctx.stub.putPrivateData(collection, compositeKey, Buffer.from(JSON.stringify(asset)));
        }
    }

    _composeCollectionName(org1, org2) {
        return [org1, org2].sort().join('-');
    }
}

module.exports = BlindAuction;
