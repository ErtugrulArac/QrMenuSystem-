"use server";

import { prisma } from "@/utils/connect";
import { headers } from "next/headers";

// fetchProduct fonksiyonu - sadece veri döndür, rendering client-side
export const fetchProduct = async (page: number, cat?: string) => {
    headers();

    const limit = 8;
    if (!cat) {
        try {
            const result = await prisma.products.findMany({
                take: limit,
                skip: (page - 1) * limit,
            });

            return result;

        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }

    }

    if (cat) {
        try {
            const result = await prisma.products.findMany({
                where: {
                    categoryId: cat,
                }
            });

            return result;

        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

}