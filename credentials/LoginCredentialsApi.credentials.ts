import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class LoginCredentialsApi implements ICredentialType {
  name = 'loginCredentialsApi';
  displayName = 'Login Credentials API';
  documentationUrl = '';
  properties: INodeProperties[] = [
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
  ];
}
