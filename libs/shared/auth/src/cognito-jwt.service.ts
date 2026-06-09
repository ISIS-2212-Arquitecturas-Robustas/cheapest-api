import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

@Injectable()
export class CognitoJwtService {
  private readonly client: JwksClient;
  private readonly issuer: string;
  private readonly clientId: string;

  constructor() {
    const region = process.env.COGNITO_REGION ?? 'us-east-1';
    const userPoolId = process.env.COGNITO_USER_POOL_ID ?? '';
    this.clientId = process.env.COGNITO_CLIENT_ID ?? '';
    this.issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    this.client = new JwksClient({
      jwksUri: `${this.issuer}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000, // 10 min
    });
  }

  async verify(token: string): Promise<jwt.JwtPayload> {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded.payload === 'string' || !decoded.header.kid) {
      throw new UnauthorizedException('Token inválido');
    }

    let signingKey: string;
    try {
      const key = await this.client.getSigningKey(decoded.header.kid);
      signingKey = key.getPublicKey();
    } catch {
      throw new UnauthorizedException('No se pudo obtener la clave de firma');
    }

    try {
      const payload = jwt.verify(token, signingKey, {
        issuer: this.issuer,
        algorithms: ['RS256'],
      }) as jwt.JwtPayload;

      if (payload['token_use'] !== 'access') {
        throw new UnauthorizedException('Se requiere un access token');
      }

      return payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
