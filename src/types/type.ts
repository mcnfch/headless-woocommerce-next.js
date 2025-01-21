export type Product = {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: Array<{
        src: string;
        alt: string;
    }>;
    description?: string;
    stock_status?: string;
    regular_price?: string;
    selectedOptions?: Record<string, string>;
}

export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    currency: string;
    image: string;
    selectedOptions?: Record<string, string>;
}
