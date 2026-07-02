import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "./rate-limiter";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    status: string;
    username: string;
    idCardUrl?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      status: string;
      username: string;
      idCardUrl?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
    username: string;
    idCardUrl?: string | null;
    lastChecked?: number;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET || "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          role: "STUDENT",
          status: "PENDING",
          idCardUrl: null,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const email = credentials.email.toLowerCase().trim();
        const lockoutKey = `rate:auth:email:${email}`;

        // Check lock out: max 5 failed attempts within a 15-minute window
        const limiter = await rateLimit(lockoutKey, 5, 15 * 60 * 1000);
        if (!limiter.success) {
          throw new Error("Too many failed login attempts. Your account is locked for 15 minutes.");
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { studentProfile: true },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password");
        }

        // On successful authentication, delete the lockout rate limit record
        try {
          await prisma.rateLimit.delete({
            where: { key: lockoutKey },
          });
        } catch {
          // Ignore if key didn't exist
        }

        return {
          id: user.id,
          email: user.email,
          name: user.studentProfile?.name || "Student",
          role: user.role,
          status: user.status,
          username: user.studentProfile?.username || "",
          idCardUrl: user.idCardUrl || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.username = user.username;
        token.idCardUrl = user.idCardUrl || null;
      }
      
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as any;
        const githubUsername = githubProfile.login;
        const githubId = githubProfile.id.toString();

        let dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { githubId: githubId },
              { email: githubProfile.email || `${githubUsername}@github.com` }
            ]
          },
          include: { studentProfile: true }
        });

        if (!dbUser) {
          // Create new user with status PENDING
          dbUser = await prisma.user.create({
            data: {
              email: githubProfile.email || `${githubUsername}@github.com`,
              githubId: githubId,
              role: "STUDENT",
              status: "PENDING",
              studentProfile: {
                create: {
                  username: githubUsername,
                  name: githubProfile.name || githubUsername,
                  role: "CSE Student",
                  bio: githubProfile.bio || "No bio added yet.",
                  avatarUrl: githubProfile.avatar_url || "https://placehold.co/150",
                  stats: {
                    bugsFixed: 0,
                    coffeeConsumed: 0
                  }
                }
              }
            },
            include: { studentProfile: true }
          });
        } else if (!dbUser.githubId) {
          // Link githubId if previously signed up with email
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { githubId: githubId },
            include: { studentProfile: true }
          });
        }

        token.id = dbUser.id;
        token.role = dbUser.role;
        token.status = dbUser.status;
        token.username = dbUser.studentProfile?.username || githubUsername;
        token.idCardUrl = dbUser.idCardUrl || null;
      }

      // Check the database for latest status/role every 10 seconds
      if (token.id) {
        const now = Date.now();
        const cooldown = 10000; // 10s cooldown
        if (!token.lastChecked || now - token.lastChecked > cooldown) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id },
              select: {
                role: true,
                status: true,
                idCardUrl: true,
                studentProfile: {
                  select: { username: true }
                }
              }
            });

            if (dbUser) {
              token.role = dbUser.role;
              token.status = dbUser.status;
              token.idCardUrl = dbUser.idCardUrl || null;
              token.username = dbUser.studentProfile?.username || token.username;
              token.lastChecked = now;
            } else {
              token.status = "DELETED";
            }
          } catch (e) {
            console.error("Error updating JWT token from DB:", e);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (token.status === "DELETED") {
          return null as any;
        }
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.username = token.username;
        session.user.idCardUrl = token.idCardUrl || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours sliding refresh
  },
  secret: process.env.NEXTAUTH_SECRET,
};

