import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';

export interface GraphUserInfo {
  displayName: string;
  email: string;
  jobTitle: string | null;
  department: string | null;
  azureId: string;
  profilePicture?: string;
}

interface CachedUser extends GraphUserInfo {
  cachedAt: number;
}

@Injectable()
export class GraphService {
  private readonly confidentialClient: ConfidentialClientApplication;
  private readonly graphScopes = ['https://graph.microsoft.com/.default'];
  private readonly userCache = new Map<string, CachedUser>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;

  constructor(private readonly configService: ConfigService) {
    const tenantId = this.configService.get<string>('AZURE_TENANT_ID');
    const clientId = this.configService.get<string>('AZURE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AZURE_CLIENT_SECRET');

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error(
        'Azure AD configuration missing: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET',
      );
    }

    const msalConfig: Configuration = {
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        clientSecret,
      },
    };

    this.confidentialClient = new ConfidentialClientApplication(msalConfig);
  }

  async getMe(frontendToken: string): Promise<GraphUserInfo> {
    const graphToken = await this.acquireGraphTokenOnBehalfOf(frontendToken);
    return this.fetchUserInfo('me', graphToken);
  }

  async getUserByEmail(email: string, frontendToken: string): Promise<GraphUserInfo> {
    const key = email.toLowerCase();
    const cached = this.userCache.get(key);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      const { cachedAt, ...user } = cached;
      return user;
    }

    const graphToken = await this.acquireGraphTokenOnBehalfOf(frontendToken);
    const user = await this.fetchUserInfo(`users/${encodeURIComponent(email)}`, graphToken);
    this.userCache.set(key, { ...user, cachedAt: Date.now() });
    return user;
  }

  private async acquireGraphTokenOnBehalfOf(frontendToken: string): Promise<string> {
    try {
      const response = await this.confidentialClient.acquireTokenOnBehalfOf({
        oboAssertion: frontendToken,
        scopes: this.graphScopes,
      });
      if (!response?.accessToken) {
        throw new UnauthorizedException('On-Behalf-Of token acquisition failed.');
      }
      return response.accessToken;
    } catch (err) {
      throw new UnauthorizedException('Invalid frontend token or OBO flow failed.');
    }
  }

  private async fetchUserInfo(endpoint: string, graphToken: string): Promise<GraphUserInfo> {
    const headers = { Authorization: `Bearer ${graphToken}` };
    const userUrl = `https://graph.microsoft.com/v1.0/${endpoint}?$select=displayName,mail,userPrincipalName,jobTitle,department,id`;
    const photoUrl = `https://graph.microsoft.com/v1.0/${endpoint}/photos/120x120/$value`;

    const [userResp, photoResp] = await Promise.all([
      fetch(userUrl, { headers }),
      fetch(photoUrl, { headers }),
    ]);

    if (!userResp.ok) {
      throw new UnauthorizedException(
        `Graph API request failed (${userResp.status}): ${await userResp.text()}`,
      );
    }

    const userData = (await userResp.json()) as {
      displayName: string;
      mail: string | null;
      userPrincipalName: string;
      jobTitle: string | null;
      department: string | null;
      id: string;
    };

    let profilePicture: string | undefined;
    if (photoResp.ok) {
      const buffer = await photoResp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = photoResp.headers.get('content-type') || 'image/jpeg';
      profilePicture = `data:${contentType};base64,${base64}`;
    }

    return {
      displayName: userData.displayName,
      email: userData.mail || userData.userPrincipalName,
      jobTitle: userData.jobTitle,
      department: userData.department,
      azureId: userData.id,
      profilePicture,
    };
  }
}
