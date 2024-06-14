import { AffinityCompanyMapper } from '../services/affinity/mappers';
import { AttioCompanyMapper } from '../services/attio/mappers';
import { HubspotCompanyMapper } from '../services/hubspot/mappers';
import { PipedriveCompanyMapper } from '../services/pipedrive/mappers';
import { ZendeskCompanyMapper } from '../services/zendesk/mappers';
import { ZohoCompanyMapper } from '../services/zoho/mappers';
import { CloseCompanyMapper } from '../services/close/mappers';

const hubspotCompanyMapper = new HubspotCompanyMapper();
const zendeskCompanyMapper = new ZendeskCompanyMapper();
const zohoCompanyMapper = new ZohoCompanyMapper();
const pipedriveCompanyMapper = new PipedriveCompanyMapper();
const attioCompanyMapper = new AttioCompanyMapper();
const closeCompanyMapper = new CloseCompanyMapper();

const affinityCompanyMapper = new AffinityCompanyMapper();
export const companyUnificationMapping = {
  hubspot: {
    unify: hubspotCompanyMapper.unify.bind(hubspotCompanyMapper),
    desunify: hubspotCompanyMapper.desunify.bind(hubspotCompanyMapper),
  },
  pipedrive: {
    unify: pipedriveCompanyMapper.unify.bind(pipedriveCompanyMapper),
    desunify: pipedriveCompanyMapper.desunify.bind(pipedriveCompanyMapper),
  },
  zoho: {
    unify: zohoCompanyMapper.unify.bind(zohoCompanyMapper),
    desunify: zohoCompanyMapper.desunify.bind(zohoCompanyMapper),
  },
  zendesk: {
    unify: zendeskCompanyMapper.unify.bind(zendeskCompanyMapper),
    desunify: zendeskCompanyMapper.desunify.bind(zendeskCompanyMapper),
  },
  attio: {
    unify: attioCompanyMapper.unify.bind(attioCompanyMapper),
    desunify: attioCompanyMapper.desunify.bind(attioCompanyMapper),
  },
  close: {
    unify: closeCompanyMapper.unify.bind(closeCompanyMapper),
    desunify: closeCompanyMapper.desunify.bind(closeCompanyMapper),
  },
  affinity: {
    unify: affinityCompanyMapper.unify.bind(affinityCompanyMapper),
    desunify: affinityCompanyMapper.desunify.bind(affinityCompanyMapper),
  },
};
