export type categoryType = {
    id: string;
    name: string;
    image: string;
    ename: string;
}[];

export interface categoryTypes {
    id: string;
    name: string;
    ename: string;
    image: string;
  }

export type productType = {
    id: number & string;
    image: string;
    name: string;
    description: string;
    price: number;
}[];

export type oneCategoryType = {
    id: number & string;
    name: string;
    ename: string;
    image: string;
}

export type oneProductType = {
    id: number & string;
    image: string;
    name: string;
    ename: string;
    description: string | null;
    edescription: string | null;
    price: number;
    categoryId?: string;
};