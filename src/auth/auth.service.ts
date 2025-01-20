import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AUTH_BASE_URL') || 'http://localhost:3000';
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/checklogin`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.statusCode !== 200) {
        throw new UnauthorizedException(response.data.message || 'Authentication failed');
      }

      return true;
    } catch (error) {
      if (error.response?.data) {
        throw new UnauthorizedException(error.response.data.message || 'Authentication failed');
      }
      throw new UnauthorizedException('Authentication service unavailable');
    }
  }
}
