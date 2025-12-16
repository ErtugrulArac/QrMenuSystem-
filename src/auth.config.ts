import Credentials from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from "next-auth"
import { LoginSchema } from "./schemas"
import { prisma } from "./utils/connect";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log('🔐 Credentials provider authorize called');
        
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) {
          console.log('❌ Credentials validation failed');
          return null;
        }

        const { email, password } = validatedFields.data;
        const normalizedEmail = email.toLowerCase().trim();
        
        console.log('🔑 Auth config: Finding user with email:', normalizedEmail);
        
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          console.log('❌ User not found in auth config');
          return null;
        }

        if (!user.password) {
          console.log('❌ User has no password');
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        console.log('✅ Password match in auth config:', passwordsMatch);

        if (passwordsMatch) {
          console.log('✅ Authorization successful');
          return user;
        }

        console.log('❌ Password mismatch in auth config');
        return null;
      }
    })
  ],
} satisfies NextAuthConfig