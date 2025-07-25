import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  ApplicationError,
} from 'n8n-workflow';


export class LoginNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Login Node',
    name: 'loginNode',
    icon: 'file:icons/logo.svg',
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
        description: 'Name of the organization',
      },
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
        description: 'Username for login',
      },
      {
        displayName: 'Login URL',
        name: 'loginUrl',
        type: 'string',
        default: '',
        description: 'URL where login should be performed',
      },
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Session ID for browser automation',
      },

    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];




    for (let i = 0; i < items.length; i++) {
      const org = this.getNodeParameter('orgName', i) as string;
      const rawUsername = this.getNodeParameter('username', i) as string;
      const loginUrl = this.getNodeParameter('loginUrl', i) as string;
      const sessionId = this.getNodeParameter('sessionId', i) as string;


      try {

        const secretRes = await this.helpers.request({
          method: 'POST',
          url: `http://10.0.2.6:8000/api/api/retrieve-password`,
          body: {
            organization_name: org,
            username: rawUsername,
            login_url: loginUrl,

          },
          json: true,
        });

        // Extract password and validate
        const password = secretRes.secret || secretRes.password || secretRes.secret_value || secretRes.value;
        if (!password) {
         throw new ApplicationError(`Password not found in secret response.
         Request: ${JSON.stringify({ org, loginUrl, rawUsername })}
         Response: ${JSON.stringify(secretRes)}`);

        }


        const actualUsername = rawUsername.includes('-') ? rawUsername.split('-').pop() : rawUsername;


        const browserRes = await this.helpers.request({
          method: 'POST',
          url: `http://10.0.2.6:8000/api/task/execute`,
          body: {
            session_id: sessionId,
            task: `navigate to the ${loginUrl} and Login with the Username as ${actualUsername} and password as ${password} and stop execution after login `
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
