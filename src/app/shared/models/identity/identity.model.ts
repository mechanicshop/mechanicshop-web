export interface claim {
  type: string;
  value: string;
}

export interface appUser {
  userId: string;
  email: string;
  roles: string[];
  claims: claim[];
}

export interface tokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresOnUtc: string;
}

export interface generateTokenQuery {
  email: string;
  password: string;
}

export interface refreshTokenQuery {
  refreshToken: string;
  expiredAccessToken: string;
}
