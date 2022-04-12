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

export class RequestTransferController {
  constructor(
    // @service(FabricClient) private fabricClient: FabricClient
  ) { }
  @post('/fabric/api/v1/RequestTransfer', {
    responses: {
      '200': {
        description: 'RequestTransfer',
        content: {
          'application/json': {
            schema: getModelSchemaRef(RequestTransfer, {
            })
          }
        },
      },
    },
  })
  async RequestTransfer(@requestBody(RequestTransfer) request_transfer: RequestTransfer): Promise<any> {
    try {
      await fabricClient.connect(request_transfer.fabricUserName);
      console.log(TAG, "Connected. Invoking");
      const result = await fabricClient.invokeTransfer('Transfer', request_transfer.to, request_transfer.value);
      console.log(TAG, result);
      await fabricClient.disconnect();
    } catch (error) {
      return error;
    }
  }
}