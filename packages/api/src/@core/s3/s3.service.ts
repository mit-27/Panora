import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { FileInfo } from '@@core/rag/types';
import {
  GetObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { ServiceRegistry } from '@filestorage/file/services/registry.service';
import { IFileService } from '@filestorage/file/types';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { BUCKET_NAME } from './constants';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(private envService: EnvironmentService, private fileServiceRegistry: ServiceRegistry) {
    // const creds = this.envService.getAwsCredentials();
    const creds = this.envService.getMinioCredentials();
    this.s3 = new S3Client({
      endpoint: 'http://minio:9000',
      region: 'us-east-1',
      forcePathStyle: true,
      //region: creds.region,
      credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
      },
    });
  }

  async uploadFilesFromUrls(
    urlsWithKeys: FileInfo[],
    linkedUserId: string
  ): Promise<void> {
    const batchSize = 10;
    for (let i = 0; i < urlsWithKeys.length; i += batchSize) {
      const batch = urlsWithKeys.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async ({ id, url, s3Key, provider }) => {
          try {
            const service: IFileService = this.fileServiceRegistry.getService(provider.toLowerCase().trim());
            if (!service) return;
            await service.streamFileToS3(
              id,
              linkedUserId,
              this.s3,
              s3Key,
            );
            console.log(`Successfully uploaded ${s3Key} from ${provider}`);
          } catch (error) {
            console.error(
              `Failed to upload file from ${url} to ${s3Key} (${provider}):`,
              error,
            );
            throw error;
          }
        }),
      );
    }
  }

  async getReadStream(s3Key: string): Promise<Readable> {
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
    };
    const command = new GetObjectCommand(getObjectParams);
    const { Body } = await this.s3.send(command);
    return Body as Readable;
  }
}
