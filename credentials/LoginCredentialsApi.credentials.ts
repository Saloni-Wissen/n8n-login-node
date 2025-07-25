import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class LoginCredentialsApi implements ICredentialType {
  name = 'loginCredentialsApi';
  displayName = 'Login Credentials API';
  documentationUrl = 'https://docs.n8n.io/credentials/';
  properties: INodeProperties[] = [

    {
      displayName: 'Browser-Use Base URL',
      name: 'browserBaseUrl',
      type: 'string',
      default: 'http://20.244.88.186:8000/api',
      description: 'Base URL for the Browser-Use automation service',
    },
  ];
}
