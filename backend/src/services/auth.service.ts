import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { User, Role } from '@prisma/client';

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
