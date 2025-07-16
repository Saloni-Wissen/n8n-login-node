import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  ApplicationError,
} from 'n8n-workflow';
import { normalizeUsername } from '../../utils/normalize';

export class LoginNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Login Node',
    name: 'loginNode',
    icon: 'file:icons8-vault-68.svg',
    group: ['transform'],
    version: 1,
    description: 'Custom login node to authenticate and trigger browser automation',
    defaults: {
      name: 'LoginNode',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        displayName: 'Organization Name',
        name: 'orgName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Login URL',
        name: 'loginUrl',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Secret Server Base URL',
        name: 'secretBaseUrl',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Browser-Use Base URL',
        name: 'browserBaseUrl',
        type: 'string',
        default: 'http://localhost:5678',
      },
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
      },
      {
        displayName: 'Cloud Provider',
        name: 'cloudProvider',
        type: 'options',
        options: [
          {
            name: 'Azure',
            value: 'azure',
          },
        ],
        default: 'azure',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const org = this.getNodeParameter('orgName', i) as string;
      const rawUsername = this.getNodeParameter('username', i) as string;
      const safeUsername = normalizeUsername(rawUsername);
      const loginUrl = this.getNodeParameter('loginUrl', i) as string;
      const secretBaseUrl = this.getNodeParameter('secretBaseUrl', i) as string;
      const browserBaseUrl = this.getNodeParameter('browserBaseUrl', i) as string;
      const sessionId = this.getNodeParameter('sessionId', i) as string;
      const cloud_provider = this.getNodeParameter("cloudProvider",i) as string;
      try {
        // 1. Get password from secret server (Azure path)
        const secretRes = await this.helpers.request({
          method: 'POST',
          url: `${secretBaseUrl}/secrets/secret`,
          body: {
            organization_name: org,
            username: safeUsername,
            cloud_provider: cloud_provider,
          },
          json: true,
        });

        // Extract password and validate
        const password = secretRes.secret || secretRes.password || secretRes.secret_value || secretRes.value;
        if (!password) {
          throw new ApplicationError(`Password not found in secret response. Response: ${JSON.stringify(secretRes)}`);
        }

        // Extract actual username from the format "domain-username" (e.g., "google-com-raman" -> "raman")
        const actualUsername = rawUsername.includes('-') ? rawUsername.split('-').pop() : rawUsername;

        // 2. Trigger Browser-Use login task
        const browserRes = await this.helpers.request({
          method: 'POST',
          url: `${browserBaseUrl}/task/execute`,
          body: {
            session_id: sessionId,
            task: `navigate to the url ${loginUrl} and login with username as ${actualUsername} and password as ${password}`
          },
          json: true,
        });

        returnData.push({
          json: {
            success: true,
            loginResult: browserRes,
          },
        });
      } catch (error) {
        returnData.push({
          json: {
            success: false,
            error: error.message || error,
          },
        });
      }
    }

    return [returnData];
  }
}
