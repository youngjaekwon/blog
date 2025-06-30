import { Link } from 'react-router';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              My Blog
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Mobile menu button - can be expanded later */}
          <div className="md:hidden">
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}