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
import { post, requestBody, getModelSchemaRef } from '@loopback/rest';
import { Transfer } from '../models/transfer.model';
import { RequestTransfer } from '../models/request_transfer.model';
import { service } from '@loopback/core';
import { FabricClient } from '../services/fabric-client.service'
const fabricClient = new FabricClient();
const TAG = 'TransferController:';

export class TransferController {
  constructor(
    // @service(FabricClient) private fabricClient: FabricClient
  ) { }
  @post('/fabric/api/v1/transfer', {
    responses: {
      '200': {
        description: 'Transfer',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Transfer, {
            })
          }
        },
      },
    },
  })
  async Transfer(@requestBody(Transfer) transfer: Transfer): Promise<any> {
    try {
      console.log(TAG, "Connected. Invoking");
      const result = await fabricClient.invoke(true, 'Transfer', JSON.stringify(transfer));
      console.log(TAG, "Result", result.toString());
      await fabricClient.disconnect();
      return result;
    } catch (error) {
      return error;
    }
  }
  async RequestTransfer(@requestBody(RequestTransfer) request_transfer: RequestTransfer): Promise<any> {
    try {
      await fabricClient.connect(request_transfer.fabricUserName);
      console.log(TAG, "Connected. Invoking");
      const result = await fabricClient.invoke(true, 'Request Transfer', JSON.stringify(request_transfer));
      await fabricClient.disconnect();
    } catch (error) {
      return error;
    }
  }
}