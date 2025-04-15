import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/auth/interfaces/token-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';

// Function to extract the refresh token from cookies
const cookieExtractor = (req: Request): string | null => {
let token = null;
if (req && req.cookies) {
token = req.cookies['refresh_token'];
}
return token;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
Strategy,
'jwt-refresh', 
) {
constructor(
private readonly configService: ConfigService,
private readonly prisma: PrismaService,
) {
super({
jwtFromRequest: cookieExtractor,
secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
ignoreExpiration: true, // We validate expiration against the DB record
});
}

async validate(payload: TokenPayload): Promise<any> {
if (!payload || !payload.sub || !payload.jti) {
throw new UnauthorizedException('Invalid refresh token payload.');
}

  // Check if the refresh token exists in the database (multiple sessions allowed) 
  const refreshToken = await this.prisma.refreshToken.findUnique({
    where: { jti: payload.jti },
  });

  // Check if token exists in DB and belongs to the user in the payload
  if (!refreshToken || refreshToken.userId !== payload.sub) {
      throw new UnauthorizedException('Refresh token not found or invalid.');
  }

  // Check if the token stored in the database has expired
  if (refreshToken.expiresAt < new Date()) {
      console.log('[JwtRefreshStrategy] Refresh token expired in DB.'); 
      // Clean up expired token from DB 
      await this.prisma.refreshToken.delete({ where: { jti: payload.jti }});
      throw new UnauthorizedException('Refresh token expired.');
  }

  return {
    userId: payload.sub,
    email: payload.email, 
    role: payload.role,   
    jti: payload.jti,     
  };

}
}
