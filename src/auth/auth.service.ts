import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {

  }
  signupLocal(dto: AuthDto) {
    // this.prisma.user.findUnique(
    //   {
    //     where: {
    //       email
    //     }
    //   }
    // )
  }
  signinLocal() {}
  logout() {}
  refreshTokens() {}
}
