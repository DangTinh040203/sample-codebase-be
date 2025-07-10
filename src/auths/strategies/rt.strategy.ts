import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '@/common/@types';
import { Env, StrategiesTypes } from '@/common/constants';

@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  StrategiesTypes.JWT_REFRESH,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(Env.JWT_SECRET),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    return payload;
  }
}
