import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-gray-600 mb-8">
                    Sorry, we couldn't find the page you're looking for.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
