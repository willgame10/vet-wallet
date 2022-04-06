'use strict';

const fs = require('fs');
const path = require('path');

const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

const testNetworkRoot = path.resolve(require('os').homedir(), 'Desktop/fabric-samples/test-network');

async function main() {
    try {
        // Create a new FileSystemWallet object for managing identities.
        const wallet = await Wallets.newFileSystemWallet('./wallet');

        // Process input parameters.
        let args = process.argv.slice(2);

        const registrarLabel = args[0];

        // Check to see if we've already enrolled the registrar user.
        let registrarIdentity = await wallet.get(registrarLabel);
        if (!registrarIdentity) {
            console.log(`An identity for the registrar user ${registrarLabel} does not exist in the wallet`);
            console.log('Run the enrollUser.js application before retrying');
            return;
        }

        const orgName = registrarLabel.split('@')[1];
        const orgNameWithoutDomain = orgName.split('.')[0];

        // Read the connection profile.
        let connectionProfile = JSON.parse(fs.readFileSync(
            path.join(testNetworkRoot, 
                'organizations/peerOrganizations', 
                orgName, 
                `/connection-${orgNameWithoutDomain}.json`), 'utf8')
        );

        // Create a new CA client for interacting with the CA.
        const ca = new FabricCAServices(connectionProfile['certificateAuthorities'][`ca.${orgName}`].url);

        const provider = wallet.getProviderRegistry().getProvider(registrarIdentity.type);
		const registrarUser = await provider.getUserContext(registrarIdentity, registrarLabel);

        const enrollmentID = args[1];

        // optional parameters
        let optional = {};
        if (args.length > 2) {
            optional = JSON.parse(args[2]);
        }

        // Register the user and return the enrollment secret.
        let registerRequest = {
            enrollmentID: enrollmentID,
            enrollmentSecret: optional.secret || "",
            role: 'client',
            attrs: optional.attrs || []
        };
        const secret = await ca.register(registerRequest, registrarUser);
        console.log(`Successfully registered the user with the ${enrollmentID} enrollment ID and ${secret} enrollment secret.`);
    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        process.exit(1);
    }
}

main().then(() => {
    console.log('User registration completed successfully.');
}).catch((e) => {
    console.log('User registration exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
