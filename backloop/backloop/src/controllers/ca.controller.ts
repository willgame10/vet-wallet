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
import { post,  requestBody, getModelSchemaRef} from '@loopback/rest';
import { User, } from '../models';
import { FabricCAClient } from '../services/fabric-ca-client.service'
const fabricCAClient = new FabricCAClient()
const TAG = 'FabricCAController:';
const FABRICORG = 'ca-org1';
export class FabricCAController {
  constructor(
  ) { }
  
  @post('/user/api/v1/enrollAdmin', {
    responses: {
      '200': {
        description: 'Enroll Admin',
        content: { 'application/json': { schema: getModelSchemaRef(User) } },
      },
    },
  })
  async enrollAdmin(@requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
        }),
      },
    },
  })
  user: User): Promise<any> {
    const result = await fabricCAClient.enrollAdmin(user.fabricUserName, user.password, FABRICORG);
    console.log(TAG, "Register", result)
    return result;
  }

  @post('/user/api/v1/enrollUser', {
    responses: {
      '200': {
        description: 'Enroll User',
        content: { 'application/json': { schema: getModelSchemaRef(User) } },
      },
    },
  })
  async enrollUser(@requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
        }),
      },
    },
  })
  user: User): Promise<any> {
    const result = await fabricCAClient.enrollUser(user.fabricUserName, user.password, FABRICORG);
    console.log(TAG, "Register", result)
    return result;
  }

  @post('/user/api/v1/registerUser', {
    responses: {
      '200': {
        description: 'Register User',
        content: { 'application/json': { schema: getModelSchemaRef(User) } },
      },
    },
  })
  async registerUser(@requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
        }),
      },
    },
  })
  user: User): Promise<any> {
    const result = await fabricCAClient.registerUser(user.fabricUserName, user.password, FABRICORG);
    console.log(TAG, "Register", result)
    return result;
  }

  @post('/user/api/v1/registerAndEnrollUser', {
    responses: {
      '200': {
        description: 'Register And Enroll User',
        content: { 'application/json': { schema: getModelSchemaRef(User) } },
      },
    },
  })
  async registerAndEnrollUser(@requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
        }),
      },
    },
  })
  user: User): Promise<any> {
    const result = await fabricCAClient.registerAndEnrollUser(user.fabricUserName, user.password, FABRICORG);
    console.log(TAG, "Register", result)
    return result;
  }

}
