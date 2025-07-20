import { MdSearch } from "react-icons/md";
import { Template } from "../../services/api/template";

interface TemplateFiltersProps {
  filters: {
    category: string;
    tier: string;
    search: string;
  };
  onFiltersChange: (filters: {
    category: string;
    tier: string;
    search: string;
  }) => void;
  templates: Template[];
}

export default function TemplateFilters({
  filters,
  onFiltersChange,
  templates,
}: TemplateFiltersProps) {
  // Get unique categories and tiers from templates
  const categories = Array.from(new Set(templates.map(t => t.category)));
  const tiers = Array.from(new Set(templates.map(t => t.tier)));

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Templates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <MdSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        {/* Tier Filter */}
        <select
          value={filters.tier}
          onChange={(e) => handleFilterChange('tier', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        >
          <option value="all">All Tiers</option>
          {tiers.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters */}
      {(filters.search || filters.category !== 'all' || filters.tier !== 'all') && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                ×
              </button>
            </span>
          )}
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                ×
              </button>
            </span>
          )}
          {filters.tier !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Tier: {filters.tier}
              <button
                onClick={() => handleFilterChange('tier', 'all')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => onFiltersChange({ category: 'all', tier: 'all', search: '' })}
            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
