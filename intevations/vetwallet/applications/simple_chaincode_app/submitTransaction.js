'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const { Wallets, Gateway } = require('fabric-network');

const testNetworkRoot = path.resolve(require('os').homedir(), 'go/src/github.com/hyperledger/fabric-samples/test-network');

async function main() {
    const gateway = new Gateway();
    const wallet = await Wallets.newFileSystemWallet('./wallet');

    try {
        let args = process.argv.slice(2);

        const identityLabel = args[0];
        const functionName = args[1];
        const chaincodeArgs = args.slice(2);

        const orgName = identityLabel.split('@')[1];
        const orgNameWithoutDomain = orgName.split('.')[0];

        let connectionProfile = JSON.parse(fs.readFileSync(
            path.join(testNetworkRoot,
                'organizations/peerOrganizations',
                orgName,
                `/connection-${orgNameWithoutDomain}.json`), 'utf8')
        );

        let connectionOptions = {
            identity: identityLabel,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }
        };

        console.log('Connect to a Hyperledger Fabric gateway.');
        await gateway.connect(connectionProfile, connectionOptions);

        console.log('Use channel "mychannel".');
        const network = await gateway.getNetwork('mychannel');

        console.log('Add block listener.');
        const blockListener = await network.addBlockListener(
            async (blockEvent) => {
                console.log();
                console.log('-----------------Block listener-----------------');

                console.log(`************************************************`);
                console.log(`Block header: ${util.inspect(blockEvent.blockData.header, { showHidden: false, depth: 5 })}`);
                console.log(`************************************************`);
                console.log(`Block data: ${util.inspect(blockEvent.blockData.data, { showHidden: false, depth: 5 })}`);
                console.log(`************************************************`);
                console.log(`Block metadata: ${util.inspect(blockEvent.blockData.metadata, { showHidden: false, depth: 5 })}`);
                console.log(`************************************************`);
                console.log('------------------------------------------------');
                console.log();
            }
        );

        console.log('Use SimpleContract.');
        const contract = network.getContract('simple_chaincode');

        console.log('Add contract listener.');
        const contractListener = await contract.addContractListener(
            async (contractEvent) => {
                console.log();
                console.log('---------------Contract listener----------------');
                console.log(`Event name: ${contractEvent.eventName}, payload: ${contractEvent.payload.toString()}`);
                console.log('------------------------------------------------');
                console.log();
            }
        );

        console.log('Add commit listener.');
        let tx = contract.createTransaction(functionName);
        const commitListener = await network.addCommitListener(
            (error, commitEvent) => {
                console.log();
                console.log('----------------Commit listener-----------------');

                if (error) {
                    console.error(error);
                    return;
                }

                console.log(`Transaction ${commitEvent.transactionId} status: ${commitEvent.status}`);
                console.log('------------------------------------------------');
                console.log();
            },
            network.getChannel().getEndorsers(),
            tx.getTransactionId()
        );

        console.log('Submit ' + functionName + ' transaction.');
        const response = await tx.submit(...chaincodeArgs);

        setTimeout(() => {
            if (`${response}` !== '') {
                console.log(`Response from ${functionName}: ${response}`);
            }
        }, 20000);

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
    } finally {
        console.log('Disconnect from the gateway.');
        gateway.disconnect();
    }
}

main().then(() => {
    console.log('Transaction execution completed successfully.');
}).catch((e) => {
    console.log('Transaction execution exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});