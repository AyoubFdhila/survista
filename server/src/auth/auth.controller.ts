import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Res,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthResponseUser } from './dto/auth-response-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

// Decorator to mark routes as public
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService, 
    private readonly usersService: UsersService    
  ) {}

  // --- Public Register Endpoint ---
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new Survey Manager user' })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<AuthResponseUser> {
    try {
      this.logger.log(`Attempting registration for ${registerUserDto.email}`);
      return await this.authService.register(registerUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      this.logger.error(`Registration controller error for ${registerUserDto.email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Registration failed.');
    }
  }

  // --- Public Login Endpoint ---
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Log in a user with email and password' })
  @ApiBody({ type: LoginUserDto })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseUser> {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.log(`User logged in: ${user.email}`);
    return this.authService.issueTokensAndSetCookies(user, response);
  }

  // --- /me Endpoint ---
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Returns the current user data.', type: AuthResponseUser }) 
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req: Request): AuthResponseUser {
    const user = req.user as AuthResponseUser; 
    return user;
  }

  // --- /logout Endpoint ---
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out the current user' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Logout successful, cookies cleared.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ message: string }> {
    const user = req.user as AuthResponseUser;
    await this.authService.logout(user.userId, response);
    this.logger.log(`Logout endpoint called for user: ${user.email}`);
    return { message: 'Logout successful' };
  }

  // --- Refresh Token Endpoint ---
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully', type: AuthResponseUser })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or Expired Refresh Token' })
  async handleRefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseUser> {
    const { userId, jti } = req.user as { userId: string; jti: string; email?: string; role?: string }; // Extract from req.user

    this.logger.log(`Received token refresh request for user ${userId} using JTI ${jti}`);

    // Call AuthService to perform token rotation and get new tokens
    const { accessToken, refreshToken } = await this.authService.refreshTokens(userId, jti);

    // --- Call the setAuthCookies helper method from AuthService ---
    this.authService.setAuthCookies(res, accessToken, refreshToken);

    // --- Fetch user details and return DTO ---
    const user = await this.usersService.findUserById(userId);
    if (!user) {
       // Handle case where user might not be found after validation 
       this.logger.error(`User ${userId} not found after successful token refresh validation.`);
       throw new InternalServerErrorException('Could not retrieve user details after refresh.');
    }

    return { userId: user.userId, email: user.email, name: user.name, role: user.role };
  }

   // --- Google OAuth Initiation ---
  @Get('google')
  @UseGuards(AuthGuard('google')) 
  @ApiOperation({ summary: 'Initiate Google OAuth2 login flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication.' })
  async googleAuth(@Req() req: Request) {}

  // --- Google OAuth Callback ---
  @Get('google/callback')
  @UseGuards(AuthGuard('google')) 
  @ApiOperation({ summary: 'Handles Google OAuth2 callback. Sets cookies and redirects.' })
  @ApiResponse({ status: 302, description: 'Redirects to the frontend dashboard on successful login.' })
  @ApiResponse({ status: 500, description: 'OAuth validation/login failed.' })
  async googleAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    
    const user = req.user as Omit<User, 'passwordHash'>; 
    if (!user) {
      this.logger.error('Google OAuth callback reached without user object.');
      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      res.redirect(`${frontendUrl}/auth/login?error=google_failed`);
      return;
    }

    this.logger.log(`Google OAuth successful for user: ${user.email}`);

    await this.authService.issueTokensAndSetCookies(user, res);

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    this.logger.log(`Redirecting user ${user.email} to frontend: ${frontendUrl}/dashboard`);
    res.redirect(`${frontendUrl}/dashboard`); 
  }
  
}