const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
          <div className="mt-8">
            <p className="text-gray-500 mb-2">Available pages:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/writer" className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Writer Dashboard</a>
              <a href="/orders" className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Orders</a>
              <a href="/reviews" className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Reviews</a>
              <a href="/wallet" className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Wallet</a>
              <a href="/admin" className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Admin</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
