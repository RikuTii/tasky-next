import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import Auth0Provider from "next-auth/providers/auth0";
import Credentials from "next-auth/providers/credentials";
import { TypeORMAdapter } from "@auth/typeorm-adapter";
import { DataSourceOptions } from "typeorm";

const connection: DataSourceOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  insecureAuth: true,
  synchronize: false,
};

const db_adapter: any = TypeORMAdapter(connection);

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: db_adapter,
  providers: [
    Credentials({
      name: "Custom",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@test.pl" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req: any): Promise<any> {
        const loginUser = {
          ...credentials,
          accounts: [
            {
              devices: [
                {
                  type: credentials.device,
                },
              ],
            },
          ],
        };

        const res = await fetch(process.env.API_URL + "Login", {
          method: "POST",
          headers: { "Content-type": "application/json; charset=UTF-8" },

          body: JSON.stringify(loginUser),
        });

        if (!res.ok) {
          return null;
        }

        const u = await res.json();

        const user = {
          name: u.userName,
          email: u.email,
          id: u.id,
          fcmToken: u.fcm_token,
        };
        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, session, trigger }: any) {
      token.userRole = "admin";
      if(trigger === 'update') {
        token.fcmToken = session.fcmToken;
      }
      if (user) {
        token.email = user.email;
        token.username = user.userName;
        token.id = user.id;
        token.fcmToken = user.fcmToken;
      }
      return token;
    },
    async session({ session, token, user }: any) {

      if (token) {
        session.user.email = token.email;
        session.user.username = token.userName;
        session.user.id = token.id;
        session.user.fcmToken = token.fcmToken;
      }
      return session;
    },
  },
};
