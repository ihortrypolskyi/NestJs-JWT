import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as bcrypt from 'bcrypt'
import { JwtPayload, Tokens } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const newUser = await this.prisma.user.create(
      {
        data: {
          email: dto.email,
          hash,
        }
      }
    );

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refresh_token);

    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Access denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches) throw new ForbiddenException('Access denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return true;
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!user || !user.hashedRt) throw new ForbiddenException('Access denied');

    const rtMatchers = await bcrypt.compare(rt, user.hashedRt)
    if (!rtMatchers) throw new ForbiddenException('Access denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await this.hashData(rt);
    await this.prisma.user.update(
      {
        where: {
          id: userId,
        },
        data: {
          hashedRt: hash,
        }
      }
    )

  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };


    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        jwtPayload, {
          secret: 'at-secret',
          expiresIn: 60 * 15,
        }),
      this.jwtService.signAsync(
        jwtPayload, {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7,
        }),
    ])

    return {
      access_token: at,
      refresh_token: rt
    }
  }
}
