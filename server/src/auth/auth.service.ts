import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger, 
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; 
import { JwtService } from '@nestjs/jwt'; 
import { Role, User } from '@prisma/client';
import * as argon2 from 'argon2'; 
import * as cuid from 'cuid';
import { Response } from 'express'; 
import { PrismaService } from '../prisma/prisma.service'; 
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';

// interfaces defined
interface JwtPayload { email: string; sub: string; role: Role; }
interface AuthResponseUser { userId: string; email: string; name: string; role: Role; }

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService, 
    private configService: ConfigService, 
    private prisma: PrismaService, 
    
  ) {}


  async register(registerUserDto: RegisterUserDto): Promise<AuthResponseUser> {
    try {
      const newUser = await this.usersService.createUser({
        email: registerUserDto.email,
        passwordHash: registerUserDto.password,
        name: registerUserDto.name,
        role: Role.SURVEY_MANAGER, 
      });

      //Todo  Trigger Email Verification (Logic to be added later)
      

      //Todo Company and Profile creation are deferred to a separate onboarding step/endpoint.

      return {
          userId: newUser.userId,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        };
    } catch (error) {
      this.logger.error(`Registration failed for email ${registerUserDto.email}: ${error.message}`, error.stack);
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already registered.'); 
      }
      
      throw new InternalServerErrorException('Registration failed due to an unexpected error.'); 
    }
  }

  
  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findUserByEmail(email);
    // Check if user exists, has a password set (not OAuth-only), and password matches
    if (user && user.passwordHash && (await argon2.verify(user.passwordHash, pass))) {
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
    const accessCookieAge = parseInt(this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME', '900'), 10) * 1000;
    const refreshCookieAge = parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME', '7'), 10) * 24 * 60 * 60 * 1000;
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.cookie('access_token', accessToken, {
      httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: accessCookieAge, path: '/',
    });
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: refreshCookieAge, path: '/',
    });
    this.logger.log(`Auth cookies set.`); 
}


  // --- issueTokensAndSetCookies method 
  async issueTokensAndSetCookies(user: Pick<User, 'userId' | 'email' | 'role' | 'name'>, response: Response): Promise<AuthResponseUser> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateAndStoreRefreshToken(user.userId);
    this.setAuthCookies(response, accessToken, refreshToken); 
    return { userId: user.userId, email: user.email, name: user.name, role: user.role };
  }


  // --- generateAccessToken method ---
  private async generateAccessToken(user: Pick<User, 'userId' | 'email' | 'role'>): Promise<string> {
    const payload: JwtPayload = { email: user.email, sub: user.userId, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME', '900s'),
    });
  }

  private async generateAndStoreRefreshToken(userId: string): Promise<string> {
      const jti = cuid(); // unique token ID using 
      const expiryTime = this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME', '7d');
      const days = parseInt(expiryTime, 10); 
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      try {
        // enforces single session per login/refresh
        // await this.prisma.refreshToken.deleteMany({ where: { userId } });

        // Store the JTI and expiry in the database
        await this.prisma.refreshToken.create({
            data: {
                jti: jti,
                userId: userId,
                expiresAt: expiresAt,
            },
        });
        this.logger.log(`Stored new refresh token state (JTI: ${jti}) for user ${userId}`);
      } catch (error) {
         this.logger.error(`Failed to store refresh token state for user ${userId}: ${error.message}`, error.stack);
         throw new InternalServerErrorException('Could not process session.');
      }

      // Create the JWT Refresh Token containing the JTI
      const payload = { sub: userId, jti: jti };
      return this.jwtService.sign(payload, {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: expiryTime,
      });
  }
    

  async logout(userId: string, response: Response): Promise<void> {
    try {
      // Invalidate all refresh tokens for the user in the database
      const { count } = await this.prisma.refreshToken.deleteMany({
        where: { userId: userId },
      });
      this.logger.log(`Invalidated ${count} refresh tokens for user ${userId}`);
    } catch (error) {
      // Log the error but don't prevent cookie clearing
      this.logger.error(`Failed to delete refresh tokens for user ${userId}: ${error.message}`, error.stack);
    }

    // Define cookie options based on environment
    const cookieOptions = {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict' as const, 
      path: '/',
    };

    // Clear the cookies on the client-side
    response.clearCookie('access_token', cookieOptions);
    response.clearCookie('refresh_token', cookieOptions);

    this.logger.log(`User ${userId} logged out successfully. Cookies cleared.`);
  }
  

  // --- refreshTokens method ---
  async refreshTokens(userId: string, jti: string): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(`Attempting to refresh tokens for user ${userId} using JTI ${jti}`);

    const existingRefreshToken = await this.prisma.refreshToken.findUnique({
        where: { jti: jti },
    });

    if (!existingRefreshToken || existingRefreshToken.userId !== userId || existingRefreshToken.expiresAt < new Date()) {
        this.logger.warn(`Refresh attempt failed: JTI ${jti} for user ${userId} not found, mismatched, or expired in DB.`);
        throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // Invalidate the used refresh token (Rotation)
    try {
      await this.prisma.refreshToken.delete({
        where: { jti: jti },
      });
      this.logger.log(`Successfully invalidated used refresh token (JTI: ${jti}) for user ${userId}`);
    } catch (error) {
        // Handle potential error if token was already deleted (race condition)
        this.logger.error(`Failed to delete refresh token (JTI: ${jti}) for user ${userId}: ${error.message}`, error.stack);
        // Throwing is safer to prevent potential session issues if deletion failed unexpectedly
        throw new InternalServerErrorException('Failed to invalidate session.');
    }


    // Fetch user details needed for the new access token payload
    const user = await this.usersService.findUserById(userId);
    if (!user) {
       this.logger.error(`User ${userId} not found during token refresh.`);
       throw new InternalServerErrorException('User associated with token not found.');
    }

    // Generate new access and refresh tokens
    const newAccessToken = await this.generateAccessToken(user);
    const newRefreshToken = await this.generateAndStoreRefreshToken(userId); 

    this.logger.log(`Successfully refreshed tokens for user ${userId}. New JTI issued.`);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // --- validate/create user from OAuth provider ---
  async validateOAuthUser(
    email: string,
    provider: string, // 'google' - for potential future use with other providers
    name: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    this.logger.log(`Validating OAuth user: ${email} from provider: ${provider}`);

    try {
      
      const existingUser = await this.usersService.findUserByEmail(email);

      if (existingUser) {
        this.logger.log(`OAuth user found existing account: ${email}`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...result } = existingUser;
        return result;
      }

      this.logger.log(`OAuth user not found, creating new user: ${email}`);

      const defaultRole = Role.SURVEY_MANAGER;

      const newUser = await this.usersService.createUser({
        email: email,
        name: name,
        role: defaultRole,
        // NO password needed for OAuth users initially
        passwordHash: null, 
      });

      this.logger.log(`New OAuth user created: ${newUser.email} with role ${newUser.role}`);

      return newUser;

    } catch (error) {
      this.logger.error(`Error during OAuth user validation/creation for ${email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to validate or create OAuth user.`);
    }
  }

}