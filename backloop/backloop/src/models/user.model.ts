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
import {Entity, model, property} from '@loopback/repository';
@model()
export class User extends Entity {
  
  @property({
    type: 'string',
    required: true,
  })
  fabricUserName: string;
  
  @property({
    type: 'string',
    required: true,
  })
  password: string;
  
  constructor(data?: Partial<User>) {
    super(data);
  }
}
export interface UserRelations {
  // describe navigational properties here
}
export type UserWithRelations = User & UserRelations;
