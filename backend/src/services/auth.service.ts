import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import { RegisterInput, LoginInput, GoogleLoginInput } from '../validators/auth.validator';
import { User, Role } from '@prisma/client';

const googleClient = new OAuth2Client(config.google.clientId);

type SafeUser = Omit<User, 'passwordHash'>;

const excludePassword = (user: User): SafeUser => {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

export const authService = {
  async register(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
    const { email, password, name } = input;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw AppError.conflict('Email already registered', 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: Role.CUSTOMER,
      },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = signToken(payload);

    return {
      user: excludePassword(user),
      token,
    };
  },

  async login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.passwordHash) {
      throw AppError.unauthorized(
        'This account uses Google Sign-In. Please log in with Google.',
        'OAUTH_ACCOUNT'
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = signToken(payload);

    return {
      user: excludePassword(user),
      token,
    };
  },

  async googleLogin(input: GoogleLoginInput): Promise<{ user: SafeUser; token: string }> {
    const { idToken } = input;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    }).catch(() => {
      throw AppError.unauthorized('Invalid Google ID token', 'INVALID_GOOGLE_TOKEN');
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw AppError.unauthorized('Invalid Google ID token', 'INVALID_GOOGLE_TOKEN');
    }

    const { sub: googleId, email, name } = payload;

    // Try to find user by googleId first
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // Check if a local user with this email exists — link the account
      user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: name || null,
            googleId,
            authProvider: 'google',
            role: Role.CUSTOMER,
          },
        });
      }
    }

    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = signToken(jwtPayload);

    return { user: excludePassword(user), token };
  },

  async updateProfile(userId: string, data: { name: string }): Promise<SafeUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });

    return excludePassword(user);
  },

  async getMe(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    return excludePassword(user);
  },
};

export default authService;
