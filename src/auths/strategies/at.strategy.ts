import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '@/common/@types';
import { Env, StrategiesTypes } from '@/common/constants';

@Injectable()
export class AtStrategy extends PassportStrategy(
  Strategy,
  StrategiesTypes.JWT,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(Env.JWT_SECRET),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
