import MenuItems from '@/components/MenuItems'
import LoadMore from '@/components/LoadMore'
import ProductCart from '@/components/ProductCart'
import CampaignBanner from '@/components/CampaignBanner'
import { url } from '@/lib/url'
import { productType } from '@/types'
import Button from "@/components/button";
import ScrollToTopButton from '@/components/ScrollToTopButton';

const getData = async (page: number) => {
    try {
        const res = await fetch(`${url}/api/getProducts?page=${page}&limit=8`, {
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const result = await res.json();

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

export default async function CategoryPage() {
    const data = await getData(1)
    const products = Array.isArray(data) ? data : data?.data || [];

    return (
        <div>
            <MenuItems />
            <CampaignBanner />
            <div className='mt-10'>
                {products.map((item: any) => (
                    <ProductCart key={item.id} products={item} />
                ))}
                <LoadMore />
                <Button />
            </div>
            <ScrollToTopButton />
        </div>
    )
}