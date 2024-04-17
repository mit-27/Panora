import { HubspotEngagementMapper } from '../services/hubspot/mappers';
import { PipedriveEngagementMapper } from '../services/pipedrive/mappers';
import { ZendeskEngagementMapper } from '../services/zendesk/mappers';
import { ZohoEngagementMapper } from '../services/zoho/mappers';

const hubspotEngagementMapper = new HubspotEngagementMapper();
const zendeskEngagementMapper = new ZendeskEngagementMapper();
const zohoEngagementMapper = new ZohoEngagementMapper();
const pipedriveEngagementMapper = new PipedriveEngagementMapper();

export const engagementUnificationMapping = {
  hubspot: {
    unify: hubspotEngagementMapper.unify.bind(hubspotEngagementMapper),
    desunify: hubspotEngagementMapper.desunify.bind(hubspotEngagementMapper),
  },
  pipedrive: {
    unify: pipedriveEngagementMapper.unify.bind(pipedriveEngagementMapper),
    desunify: pipedriveEngagementMapper.desunify.bind(
      pipedriveEngagementMapper,
    ),
  },
  zoho: {
    unify: zohoEngagementMapper.unify.bind(zohoEngagementMapper),
    desunify: zohoEngagementMapper.desunify.bind(zohoEngagementMapper),
  },
  zendesk: {
    unify: zendeskEngagementMapper.unify.bind(zendeskEngagementMapper),
    desunify: zendeskEngagementMapper.desunify.bind(zendeskEngagementMapper),
  },
};
