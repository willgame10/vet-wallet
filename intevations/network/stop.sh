#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

set -ev

# Shut down the Docker containers that might be currently running.
docker-compose -f docker-compose.yml stop
