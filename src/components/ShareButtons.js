'use client';

import { useEffect, useState } from 'react';

export default function ShareButtons({ title, imageUrl }) {
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
    };

    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`, '_blank');
    };

    const shareOnPinterest = () => {
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`, '_blank');
    };

    return (
        <div className="sticky top-4 z-10 bg-white/80 backdrop-blur-sm py-2 mb-8 flex justify-center space-x-4">
            <button 
                onClick={shareOnFacebook}
                className="text-blue-600 hover:text-blue-700 transition-colors"
            >
                Share on Facebook
            </button>
            <button 
                onClick={shareOnTwitter}
                className="text-sky-500 hover:text-sky-600 transition-colors"
            >
                Share on Twitter
            </button>
            <button 
                onClick={shareOnPinterest}
                className="text-red-600 hover:text-red-700 transition-colors"
            >
                Pin it
            </button>
        </div>
    );
}
