'use client';

import { useState, useEffect } from 'react';

export default function DebugProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [loadingResults, setLoadingResults] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/debug/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const loadProductsToDatabase = async () => {
    try {
      setLoadingStatus('Starting to load products into database...');
      setLoadingResults([]);

      const response = await fetch('/api/debug/load-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: products.map(p => p.id)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLoadingResults(data.results);
      setLoadingStatus(`Completed in ${(data.timeTaken / 1000).toFixed(2)} seconds`);
    } catch (error) {
      console.error('Error loading products:', error);
      setLoadingStatus(`Error: ${error.message}`);
    }
  };

  if (loading) return <div className="p-4">Loading products...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold mb-4 text-black">Debug: Product IDs</h1>
      <div className="mb-4 text-black">Total Products: {total}</div>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {products.map(product => (
          <div 
            key={product.id} 
            className="p-3 bg-gray-100 text-center rounded border border-gray-300 text-lg font-mono text-black"
          >
            {product.id}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={loadProductsToDatabase}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loadingStatus && !loadingStatus.startsWith('Completed') && !loadingStatus.startsWith('Error')}
        >
          Load Products to Database
        </button>

        {loadingStatus && (
          <div className="mt-4">
            <h2 className="text-xl font-bold text-black mb-2">Status</h2>
            <div className="text-black">{loadingStatus}</div>
            
            {loadingResults.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-bold text-black mb-2">Results</h3>
                <div className="space-y-2">
                  {loadingResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded ${
                        result.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Product {result.id}: {result.status}
                      {result.categories && (
                        <span className="ml-2">
                          Categories: {result.categories.join(', ')}
                        </span>
                      )}
                      {result.error && (
                        <span className="ml-2">Error: {result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
