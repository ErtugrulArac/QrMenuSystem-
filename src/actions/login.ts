"use server";

import { LoginSchema } from '@/schemas';
import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/utils/connect';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Hatalı değerler!" };
    }

    const { email, password } = validatedFields.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
        return { error: "Email veya şifre hatalı!" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return { error: "Email veya şifre hatalı!" };
    }

    // SignIn and handle redirect
    try {
        await signIn("credentials", {
            email: normalizedEmail,
            password,
            redirect: false,
        });
    } catch (error) {
        return { error: "Giriş başarısız!" };
    }

    // If we get here, signIn succeeded - redirect
    redirect("/dashboard");
};