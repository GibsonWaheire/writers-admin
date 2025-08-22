const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Writers Admin</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your comprehensive platform for managing writers, orders, and reviews.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 bg-white rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-2">Writer Dashboard</h3>
              <p className="text-gray-600">Manage your writing assignments and track progress.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-2">Orders</h3>
              <p className="text-gray-600">View and manage writing orders and requests.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-2">Reviews</h3>
              <p className="text-gray-600">Check feedback and ratings from clients.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-2">Wallet</h3>
              <p className="text-gray-600">Track your earnings and payment history.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
              <p className="text-gray-600">Administrative tools and system management.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
