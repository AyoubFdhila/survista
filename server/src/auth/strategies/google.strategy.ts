import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service'; 

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService, 
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URI'),
      scope: ['profile', 'email'], // Request profile and email scopes from Google
    });
  }

  // This method is called after Google has authenticated the user
  async validate(
    accessToken: string,
    refreshToken: string | undefined, // May not always be provided by Google
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    this.logger.log(`Validating Google profile for: ${profile.displayName} (${profile.emails?.[0]?.value})`);

    const { id, name, emails, photos } = profile;
    if (!emails || emails.length === 0 || !emails[0].value) {
      this.logger.error('Google profile missing email address.');
      // Signal failure to Passport via the done callback
      return done(new UnauthorizedException('Google profile must have a verified email address.'), null!);
    }

    const googleUser = {
      googleId: id,
      email: emails[0].value,
      name: name?.givenName && name?.familyName ? `${name.givenName} ${name.familyName}` : profile.displayName,
      // Optionally picture: photos?.[0]?.value
    };

    try {
      const user = await this.authService.validateOAuthUser(googleUser.email, 'google', googleUser.name); 

      if (!user) {
         this.logger.warn(`AuthService could not validate or provision user for email: ${googleUser.email}`);
         return done(new UnauthorizedException('Could not validate or provision user.'), null!);
      }

      // Signal success to Passport, passing the user object
      done(null, user);

    } catch (err) {
       this.logger.error(`Error during Google user validation/provisioning: ${err.message}`, err.stack);
      // Signal failure to Passport
      done(err, null!);
    }
  }
}