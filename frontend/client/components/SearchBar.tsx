import { Search, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Carrot,
  Milk,
  Croissant,
  Beef,
  Wheat,
  Wine,
  Candy,
} from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onStoresChange?: (stores: string[]) => void;
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const STORES = ["Fresh Market", "Shop & Save", "Local Grocer"];

const CATEGORIES = [
  { id: 1, name: "Fruits & Vegetables", icon: Carrot },
  { id: 2, name: "Dairy", icon: Milk },
  { id: 3, name: "Bakery", icon: Croissant },
  { id: 4, name: "Meat & Seafood", icon: Beef },
  { id: 5, name: "Pantry", icon: Wheat },
  { id: 6, name: "Beverages", icon: Wine },
  { id: 7, name: "Snacks", icon: Candy },
];

export default function SearchBar({
  onSearch,
  onStoresChange,
  selectedCategory,
  onSelectCategory,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const toggleStore = (store: string) => {
    setSelectedStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    );
  };

  const applyFilters = () => {
    onStoresChange?.(selectedStores);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedStores([]);
    onStoresChange?.([]);
    setShowFilters(false);
  };

  return (
    <div className="bg-gradient-to-r from-brand-green/10 to-brand-green/5 rounded-xl shadow-sm border border-brand-green/20 p-6">
      <div className="flex flex-col gap-4">
        {/* Main Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search for products... (e.g., apples, milk, bread)"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-darker focus:border-transparent"
          />
        </div>

        {/* Filter Buttons & Results Info */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {/* Categories Button */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-brand-blue-darker font-medium transition-colors border border-gray-300 rounded-lg hover:border-brand-blue-darker"
              >
                <span>{selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : "Categories"}</span>
                <ChevronDown size={16} className={`transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Dropdown */}
              {showCategories && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-max">
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      setShowCategories(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          onSelectCategory(category.id);
                          setShowCategories(false);
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${
                          selectedCategory === category.id
                            ? "bg-brand-blue-darker bg-opacity-10 text-brand-blue-darker font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <IconComponent size={16} />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-brand-blue-darker font-medium transition-colors border border-gray-300 rounded-lg hover:border-brand-blue-darker"
            >
              <Filter size={18} />
              Advanced Filters
            </button>
          </div>

          {query && (
            <span className="text-sm text-gray-600">
              Searching for: <span className="font-semibold text-gray-900">"{query}"</span>
            </span>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Stores
              </label>
              <div className="space-y-2">
                {STORES.map((store) => (
                  <div key={store} className="flex items-center">
                    <input
                      type="checkbox"
                      id={store}
                      checked={selectedStores.includes(store)}
                      onChange={() => toggleStore(store)}
                      className="w-4 h-4 bg-white border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-brand-blue-darker accent-brand-blue-darker"
                    />
                    <label
                      htmlFor={store}
                      className="ml-2 text-sm text-gray-700 cursor-pointer"
                    >
                      {store}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-brand-blue-darker text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
