import { useState } from "react";
import {
  Milk,
  Croissant,
  Carrot,
  Wheat,
  Beef,
  Wine,
  Candy,
  MoreHorizontal,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  icon: any;
  bgColor: string;
}

const CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Fruits & Vegetables",
    icon: Carrot,
    bgColor: "bg-brand-green",
  },
  { id: 2, name: "Dairy", icon: Milk, bgColor: "bg-brand-teal" },
  { id: 3, name: "Bakery", icon: Croissant, bgColor: "bg-brand-cyan" },
  { id: 4, name: "Meat & Seafood", icon: Beef, bgColor: "bg-brand-blue" },
  {
    id: 5,
    name: "Pantry",
    icon: Wheat,
    bgColor: "bg-brand-blue-dark",
  },
  {
    id: 6,
    name: "Beverages",
    icon: Wine,
    bgColor: "bg-brand-blue-darker",
  },
  { id: 7, name: "Snacks", icon: Candy, bgColor: "bg-brand-green" },
];

interface CategoryListProps {
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number) => void;
}

export default function CategoryList({
  selectedCategory,
  onSelectCategory,
}: CategoryListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="bg-gradient-to-b from-brand-teal/5 to-white rounded-xl shadow-sm border border-brand-teal/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue-darker to-brand-teal px-6 py-4">
        <h2 className="text-white font-bold text-lg">Categories</h2>
      </div>

      {/* Category List */}
      <div className="divide-y divide-gray-100">
        {CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          const isHovered = hoveredId === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`w-full px-6 py-4 flex items-center gap-4 transition-all duration-200 ${
                isSelected
                  ? "bg-brand-blue-darker bg-opacity-10 border-l-4 border-brand-blue-darker"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                className={`p-2.5 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected ? category.bgColor : "bg-gray-100"
                }`}
              >
                <IconComponent
                  size={20}
                  className={isSelected ? "text-white" : "text-gray-600"}
                />
              </div>
              <span
                className={`flex-1 text-left font-medium ${
                  isSelected
                    ? "text-brand-blue-darker"
                    : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                {category.name}
              </span>
              {isHovered && (
                <div className="text-gray-400 animate-pulse">
                  <MoreHorizontal size={18} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Select a category to view products and compare prices across stores.
        </p>
      </div>
    </div>
  );
}
