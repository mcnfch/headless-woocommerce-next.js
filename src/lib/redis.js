'use server';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getCart(sessionId) {
  const cart = await redis.get(`cart:${sessionId}`);
  return cart ? JSON.parse(cart) : { items: [], total: 0 };
}

export async function setCart(sessionId, cart) {
  await redis.set(`cart:${sessionId}`, JSON.stringify(cart), 'EX', 60 * 60 * 24 * 7); // 7 days
}

export async function addToCart(sessionId, item) {
  const cart = await getCart(sessionId);
  const existingItem = cart.items.find(i => i.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ ...item, quantity: 1 });
  }
  
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  await setCart(sessionId, cart);
  return cart;
}

export async function removeFromCart(sessionId, itemId) {
  const cart = await getCart(sessionId);
  cart.items = cart.items.filter(item => item.id !== itemId);
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  await setCart(sessionId, cart);
  return cart;
}

export async function updateQuantity(sessionId, itemId, quantity) {
  const cart = await getCart(sessionId);
  const item = cart.items.find(i => i.id === itemId);
  
  if (item) {
    item.quantity = quantity;
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await setCart(sessionId, cart);
  }
  
  return cart;
}

export async function clearCart(sessionId) {
  await redis.del(`cart:${sessionId}`);
  return { items: [], total: 0 };
}
