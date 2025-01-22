import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';

const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

export default async function AccountLayout({ children }) {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);

  if (!session.user) {
    redirect('/');
  }

  try {
    // Verify the token is still valid with WordPress
    const response = await fetch(`${WC_URL}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Bearer ${session.user.token}`
      }
    });

    if (!response.ok) {
      redirect('/');
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    redirect('/');
  }

  return (
    <div>
      {children}
    </div>
  );
}
