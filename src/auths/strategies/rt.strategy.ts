import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthsService } from '@/auths/auths.service';
import { JwtPayload } from '@/common/@types';
import { Env, StrategiesTypes } from '@/common/constants';

@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  StrategiesTypes.JWT_REFRESH,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(Env.JWT_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '');
    if (!refreshToken) {
      throw new UnauthorizedException(['Refresh token is required']);
    }

    const isValid = await this.authService.isValidRefreshToken(
      payload._id,
      refreshToken,
    );

    console.log('🚀 ~ validate ~ isValid:', isValid);

    if (!isValid)
      throw new UnauthorizedException('Refresh token invalid or used');

    return payload;
  }
}
