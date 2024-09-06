import { Injectable } from '@nestjs/common';
import { IUserService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IUserService>;

  constructor() {
    this.serviceMap = new Map<string, IUserService>();
  }

  registerService(serviceKey: string, service: IUserService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IUserService {
    const service = this.serviceMap.get(integrationId);
    // if (!service) {
    //   throw new ReferenceError(
    //     `Service not found for integration ID: ${integrationId}`,
    //   );
    // }
    return service;
  }
}
