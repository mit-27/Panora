import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';
import { UnifiedTeamOutput } from '../types/model.unified';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(TeamService.name);
  }

  async getTeam(
    id_ticketing_team: string,
    remote_data?: boolean,
  ): Promise<UnifiedTeamOutput> {
    try {
      const team = await this.prisma.tcg_teams.findUnique({
        where: {
          id_tcg_team: id_ticketing_team,
        },
      });

      // Fetch field mappings for the ticket
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: team.id_tcg_team,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedTeamOutput format
      const unifiedTeam: UnifiedTeamOutput = {
        id: team.id_tcg_team,
        name: team.name,
        description: team.description,
        field_mappings: field_mappings,
      };

      let res: UnifiedTeamOutput = unifiedTeam;

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: team.id_tcg_team,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throwTypedError(new UnifiedTicketingError({
        name: "GET_TEAM_ERROR",
        message: "TeamService.getTeam() call failed",
        cause: error
      }))
    }
  }

  async getTeams(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTeamOutput[]> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced

      const teams = await this.prisma.tcg_teams.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unifiedTeams: UnifiedTeamOutput[] = await Promise.all(
        teams.map(async (team) => {
          // Fetch field mappings for the team
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: team.id_tcg_team,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedTeamOutput format
          return {
            id: team.id_tcg_team,
            name: team.name,
            description: team.description,
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedTeamOutput[] = unifiedTeams;

      if (remote_data) {
        const remote_array_data: UnifiedTeamOutput[] = await Promise.all(
          res.map(async (team) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: team.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...team, remote_data };
          }),
        );

        res = remote_array_data;
      }
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.team.pull',
          method: 'GET',
          url: '/ticketing/teams',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throwTypedError(new UnifiedTicketingError({
        name: "GET_TEAMS_ERROR",
        message: "TeamService.getTeams() call failed",
        cause: error
      }))
    }
  }
}
