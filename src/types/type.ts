export type Product = {
    id: string;
    name: string;
    price: number;
    currency: string;
    imageSrc: string;
    imageAlt: string;
}

export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    currency: string;
}
