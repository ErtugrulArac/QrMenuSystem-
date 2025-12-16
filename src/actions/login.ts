"use server";

import { LoginSchema } from '@/schemas';
import * as z from 'zod';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';

import { signIn } from '@/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { prisma } from '@/utils/connect';

export const login = async (values: z.infer<typeof LoginSchema>) => {
    try {
        // 1. Validation
        const validatedFields = LoginSchema.safeParse(values);
        if (!validatedFields.success) {
            console.log('❌ Validation failed');
            return { error: "Hatalı değerler!" };
        }

        const { email, password } = validatedFields.data;
        const normalizedEmail = email.toLowerCase().trim();
        
        console.log('🔍 Login attempt:', normalizedEmail);
        console.log('🔐 Password length:', password.length);

        // 2. Find user in database
        console.log('📊 Querying database for email:', normalizedEmail);
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            console.log('👤 User not found in database');
            console.log('📋 Available users:', await prisma.user.findMany().then(u => u.map(x => x.email)));
            return { error: "Email kayıtlı değil!" };
        }

        console.log('✅ User found:', user.email);

        // 3. Check password
        if (!user.password) {
            console.log('❌ User has no password hash');
            return { error: "Şifre ayarlanmamış!" };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('🔐 Password match:', passwordMatch);

        if (!passwordMatch) {
            console.log('❌ Password mismatch');
            return { error: "Email veya şifre hatalı!" };
        }

        // 4. Sign in with NextAuth
        console.log('🔑 Attempting NextAuth signIn...');
        await signIn("credentials", {
            email: normalizedEmail,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT,
        });

        console.log('✅ Login successful, redirecting...');
        return { success: "Giriş başarılı!" };

    } catch (error) {
        console.log('⚠️ Catch block triggered');
        console.log('Error type:', error instanceof AuthError ? 'AuthError' : typeof error);
        console.log('Error:', error);

        if (error instanceof AuthError) {
            console.log('AuthError type:', error.type);
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email veya şifre hatalı!" };
                default:
                    return { error: "Bir hata oluştu!" };
            }
        }

        throw error;
    }
};