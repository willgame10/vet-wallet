#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

set -ev

docker-compose -f docker-compose.yml down

docker-compose -f docker-compose.yml up -d orderer.example.com couchdbOrg1Peer0 peer0.org1.example.com \
    couchdbOrg1Peer1 peer1.org1.example.com ca.org1.example.com \
    couchdbOrg2Peer0 peer0.org2.example.com couchdbOrg2Peer1 peer1.org2.example.com ca.org2.example.com \
    cli

# Wait for Hyperledger Fabric to start
# In case of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=15
sleep ${FABRIC_START_TIMEOUT}
