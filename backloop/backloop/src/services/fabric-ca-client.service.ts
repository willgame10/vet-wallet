'use strict';
/*******************************************************************************
 * Copyright (c) 2022 Belltane
 *
 * All rights reserved.
 *
 * Contributors:
 *   James Worthington - Initial implementation
 *
 * Version: 0.25
 *
 *******************************************************************************/
import { Wallets, X509Identity } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import * as fs from 'fs';
const caAdmin = "admin";
const path = require('path');
const TAG = "FabricCAClient";
export class FabricCAClient {
  caName: string;
  caOrg1: string;
  mspName: string;
  department: string;
  networkConstants: any;
  networkConfig: any;
  constructor() {
    const networkConfigPath = path.resolve(__dirname, '..', '..', 'src/constants', "config.json");
    const caOrg1 = path.resolve(__dirname, '..', '..', '..', 'backloop/src/connections/fabric-dev/fabric-ca/org1', "tls-cert.pem");
    this.caOrg1 = caOrg1;
    this.networkConfig = JSON.parse(fs.readFileSync(networkConfigPath, 'utf8'));
  }
  prettyJSONString(inputString: string) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
  }
  async enrollAdmin(adminName: string, adminPassword: string, caName: string) {
    try {
      this.mspName = this.networkConfig.organizations.Org1.mspid;
      console.log(TAG, "EnrollAdmin", adminName, "CA", caName);
      console.log(TAG, "MSPName", this.mspName);
      const caTLSCACerts = fs.readFileSync(this.caOrg1);
      const caInfo = this.networkConfig.certificateAuthorities[caName];
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      // Check to see if we've already enrolled the admin user.
      const identity = await wallet.get(adminName);
      if (identity) {
        console.log(TAG, "An identity for the admin user", adminName, "already exists in the wallet");
        return;
      }
      console.log(TAG, "Enrolling CA Admin", adminName);
      // Enroll the admin user, and import the new identity into the wallet.
      const enrollment = await ca.enroll({
        enrollmentID: adminName,
        enrollmentSecret: adminPassword
      });
      console.log(TAG, "enrollment", enrollment);
      const x509Identity: X509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: this.mspName,
        type: 'X.509',
      };
      await wallet.put(adminName, x509Identity);
      console.log("Successfully enrolled admin user", adminName, "and imported it into the wallet");
    } catch (error) {
      console.error(`Failed to enroll ca admin user ${adminName}: ${error}`);
      // process.exit(1);
    }
  }
  async registerUser(userName: string, userPassword: string, caName: string) {
    try {
      console.log("Register User");
      const caAdmin = "admin";
      console.log(TAG, "RegisterUser", userName, "CA", caName);
      //const couchDB = `{
      //  "config": "couchdbuser@",
      //}`
      //const wallet1 = await Wallets.newCouchDBWallet(couchDB);
      //const wallet2 = await Wallets.newInMemoryWallet()
      // Get CA details.
      this.mspName = this.networkConfig.organizations.Org1.mspid;
      const caTLSCACerts = fs.readFileSync(this.caOrg1);
      const caInfo = this.networkConfig.certificateAuthorities[caName];
      // Create new CA Server instance
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);
      // Check to see if we've already registered and enrolled the user.
      const userIdentity = await wallet.get(userName);
      if (userIdentity) {
        console.log("An identity for the user", userName, "already exists in the wallet");
        return;
      }
      // Check to see if we've already enrolled the admin user.
      const adminIdentity = await wallet.get(caAdmin);
      if (!adminIdentity) {
        console.log("An identity for the ca admin user", caAdmin, " does not exist in the wallet");
        console.log('Run enrollAdmin before retrying');
        return;
      }
      // Build a user object for authenticating with the CA
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, caAdmin);
      // Register the user
      const secret = await ca.register(
        {
          affiliation: this.department,
          enrollmentID: userName,
          enrollmentSecret: userPassword,
          role: "client"
        },
        adminUser
      );
      console.log("Successfully registered User", userName, secret);
      return userName + " registered successfully";
    } catch (error) {
      console.error(`Failed to register user ${userName}: ${error}`);
      return userName + " not registered: " + error;
    }
  }
  async enrollUser(userName: string, userPassword: string, caName: string) {
    try {
      console.log("Enroll User");
      const caAdmin = "admin";
      // Get CA Server details.
      this.mspName = this.networkConfig.organizations.Org1.mspid;
      const caTLSCACerts = fs.readFileSync(this.caOrg1);
      const caInfo = this.networkConfig.certificateAuthorities[caName];
      // Create a new Fabric CA Service Instance.
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      //console.log(`Wallet path: ${walletPath}`);
      // Check to see if we've already enrolled the user.
      const userIdentity = await wallet.get(userName);
      if (userIdentity) {
        console.log("An identity for the user", userName, "already exists in the wallet");
        return;
      }
      // Check to see if we've already enrolled the admin user.
      const adminIdentity = await wallet.get(caAdmin);
      if (!adminIdentity) {
        console.log("An identity for the ca admin user", caAdmin, " does not exist in the wallet");
        console.log('Run enrollAdmin before retrying');
        return;
      }
      // Enroll the user, and import the new identity into the wallet.
      const enrollment = await ca.enroll(
        {
          enrollmentID: userName,
          enrollmentSecret: userPassword
        }
      );
      const x509Identity: X509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: this.mspName,
        type: 'X.509',
      };
      await wallet.put(userName, x509Identity);
      console.log("Successfully enrolled User", userName);
      return userName + " succssfully enrolled";
    } catch (error) {
      console.error(`Failed to enroll user ${userName}: ${error}`);
      return userName + " not enrolled: " + error;
    }
  }
  async registerAndEnrollUser(userID: string, userPassword: string, caName: string): Promise<any> {
    try {
      console.log(TAG, "Register and Enroll User");
      const caName = "ca-org1";
      console.log(TAG, "RegisterAndEnrollUser", userID, "CA", caName);
      // Get CA details.
      this.mspName = this.networkConfig.organizations.Org1.mspid;
      const caTLSCACerts = fs.readFileSync(this.caOrg1);
      const caInfo = this.networkConfig.certificateAuthorities[caName];
      // Create a new Fabric CA instance
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(TAG, `Wallet path: ${walletPath}`);
      // Check to see if we've already enrolled the user.
      const userIdentity = await wallet.get(userID);
      if (userIdentity) {
        console.log("An identity for the userID", userID, "already exists in the wallet");
        return "Wallet Exists";
      }
      // Check to see if we've already enrolled the admin user.
      const adminIdentity = await wallet.get(caAdmin);
      if (!adminIdentity) {
        console.log(TAG, "An identity for the ca admin user", caAdmin, " does not exist in the wallet");
        console.log(TAG, 'Run enrollAdmin before retrying');
        return "CA Admin Does Not Exist";
      }
      // Build a ca registrar object for authenticating with the CA
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, caAdmin);
      // Register the user.
      const secret = await ca.register(
        {
          affiliation: this.department,
          enrollmentID: userID,
          enrollmentSecret: userPassword,
          role: "client"
        },
        adminUser
      );
      // Enroll the user, and import the new identity into the wallet.
      const enrollment = await ca.enroll(
        {
          enrollmentID: userID,
          enrollmentSecret: secret
        }
      );
      const x509Identity: X509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: this.mspName,
        type: 'X.509',
      };
      await wallet.put(userID, x509Identity);
      console.log(TAG, "Successfully registered and enrolled User", userID, secret, "and imported it into the wallet");
      return secret;
    } catch (error) {
      console.error(TAG, `Failed to register and/or enroll user ${userID}: ${error}`);
      return error;
    }
  }
}
