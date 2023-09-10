import "next-auth/jwt";
import "next-auth/core";

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth/jwt" {
  interface JWT {
    /** The user's role. */
    userRole?: "admin";
  }
}

declare module "next-auth" {
  interface User {
    role?: Role;
    userName?: string;
    fcmToken?: string;
    id?: number;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}
