import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const CART_COOKIE = 'cart_id';

async function getOrCreateCart(cartId) {
  let cart;
  if (cartId) {
    cart = await redis.get(`cart:${cartId}`);
    if (cart) {
      return JSON.parse(cart);
    }
  }
  
  // Create new cart if none exists
  return { items: [], total: 0 };
}

async function calculateTotal(items) {
  return items.reduce((sum, item) => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
      : parseFloat(item.price) || 0;
    return sum + (price * item.quantity);
  }, 0);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;
    const cart = await getOrCreateCart(cartId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Failed to get cart:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    let cartId = cookieStore.get(CART_COOKIE)?.value;
    
    if (!cartId) {
      cartId = uuidv4();
    }

    const cart = await getOrCreateCart(cartId);
    const requestData = await request.json();
    console.log('Cart API received data:', JSON.stringify(requestData, null, 2));
    
    const { action, ...data } = requestData;

    switch (action) {
      case 'add-item': {
        console.log('Adding item to cart:', JSON.stringify(data, null, 2));
        const { item } = data;
        if (!item || !item.id) {
          console.error('Invalid item data received:', data);
          throw new Error('Invalid item data');
        }

        const existingItem = cart.items.find(i => i.key === item.key);

        if (existingItem) {
          existingItem.quantity += item.quantity || 1;
        } else {
          cart.items.push({
            id: item.id,
            name: item.name,
            price: typeof item.price === 'string' 
              ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
              : parseFloat(item.price) || 0,
            quantity: item.quantity || 1,
            variation: item.variation || {},
            images: Array.isArray(item.images) && item.images.length > 0
              ? item.images.map(img => typeof img === 'string' ? img : img.src || '')
              : [],
            key: item.key || `${item.id}-${Object.values(item.variation || {}).join('-')}`
          });
        }
        break;
      }

      case 'remove-item': {
        const { key } = data;
        cart.items = cart.items.filter(item => item.key !== key);
        break;
      }

      case 'update-quantity': {
        const { key, quantity } = data;
        const item = cart.items.find(item => item.key === key);
        if (item) {
          item.quantity = parseInt(quantity) || 1;
        }
        break;
      }

      default:
        throw new Error('Invalid action');
    }

    cart.total = await calculateTotal(cart.items);
    await redis.set(`cart:${cartId}`, JSON.stringify(cart));
    
    const response = NextResponse.json(cart);
    if (!cookieStore.get(CART_COOKIE)) {
      response.cookies.set(CART_COOKIE, cartId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    return response;
  } catch (error) {
    console.error('Failed to update cart:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
