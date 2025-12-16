import MenuItems from '@/components/MenuItems'
import { fetchProduct } from "@/actions/getData"
import Button from "@/components/button";
import CampaignBanner from '@/components/CampaignBanner'
import ProductsRenderer from './ProductsRenderer'


type Props = {
  params: { category: string }
}

const Home = async ({ params }: Props) => {

  
  const products = await fetchProduct(1, params.category)

  return (
    <div>
      <MenuItems />
      <CampaignBanner />
      <div className='mt-10 '>
            <ProductsRenderer products={products} />
      </div>
      <Button />
    </div>
  );
};

export default Home;