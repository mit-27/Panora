import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import {
  Action,
  ActionType,
  ConnectionsError,
  format3rdPartyError,
  throwTypedError,
} from '@@core/utils/errors';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import {
  CallbackParams,
  RefreshParams,
  IFilestorageConnectionService,
} from '../../types';
import { ServiceRegistry } from '../registry.service';
import {
  AuthStrategy,
  CONNECTORS_METADATA,
  OAuth2AuthData,
  providerToType,
} from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '@@core/connections/@utils';

export type DropboxOAuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

@Injectable()
export class DropboxConnectionService implements IFilestorageConnectionService {
  private readonly type: string;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(DropboxConnectionService.name);
    this.registry.registerService('dropbox', this);
    this.type = providerToType('dropbox', 'filestorage', AuthStrategy.oauth2);
  }

  async handleCallback(opts: CallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dropbox',
          vertical: 'filestorage',
        },
      });

      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;

      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        redirect_uri: REDIRECT_URI,
        code: code,
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        grant_type: 'authorization_code',
      });
      const res = await axios.post(
        `https://api.dropbox.com/oauth2/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: DropboxOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : dropbox filestorage ' + JSON.stringify(data),
      );

      let db_res;
      const connection_token = uuidv4();

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            account_url:
              CONNECTORS_METADATA['filestorage']['dropbox'].urls.apiUrl,
            expiration_timestamp: new Date(
              new Date().getTime() + Number(data.expires_in) * 1000,
            ),
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'dropbox',
            vertical: 'filestorage',
            token_type: 'oauth',
            account_url:
              CONNECTORS_METADATA['filestorage']['dropbox'].urls.apiUrl,
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            expiration_timestamp: new Date(
              new Date().getTime() + Number(data.expires_in) * 1000,
            ),
            status: 'valid',
            created_at: new Date(),
            projects: {
              connect: { id_project: projectId },
            },
            linked_users: {
              connect: {
                id_linked_user: await this.connectionUtils.getLinkedUserId(
                  projectId,
                  linkedUserId,
                ),
              },
            },
          },
        });
      }
      return db_res;
    } catch (error) {
      throwTypedError(
        new ConnectionsError({
          name: 'HANDLE_OAUTH_CALLBACK_FILESTORAGE',
          message: `DropboxConnectionService.handleCallback() call failed ---> ${format3rdPartyError(
            'dropbox',
            Action.oauthCallback,
            ActionType.POST,
          )}`,
          cause: error,
        }),
        this.logger,
      );
    }
  }
  async handleTokenRefresh(opts: RefreshParams) {
    try {
      const { connectionId, refreshToken, projectId } = opts;
      const REDIRECT_URI = `${
        this.env.getDistributionMode() == 'selfhost'
          ? this.env.getWebhookIngress()
          : this.env.getPanoraBaseUrl()
      }/connections/oauth/callback`;

      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.cryptoService.decrypt(refreshToken),
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      });

      const res = await axios.post(
        `https://api.dropbox.com/oauth2/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: DropboxOAuthResponse = res.data;
      await this.prisma.connections.update({
        where: {
          id_connection: connectionId,
        },
        data: {
          access_token: this.cryptoService.encrypt(data.access_token),
          refresh_token: this.cryptoService.encrypt(data.refresh_token),
          expiration_timestamp: new Date(
            new Date().getTime() + Number(data.expires_in) * 1000,
          ),
        },
      });
      this.logger.log('OAuth credentials updated : dropbox ');
    } catch (error) {
      throwTypedError(
        new ConnectionsError({
          name: 'HANDLE_OAUTH_REFRESH_FILESTORAGE',
          message: `DropboxConnectionService.handleTokenRefresh() call failed ---> ${format3rdPartyError(
            'dropbox',
            Action.oauthRefresh,
            ActionType.POST,
          )}`,
          cause: error,
        }),
        this.logger,
      );
    }
  }
}
