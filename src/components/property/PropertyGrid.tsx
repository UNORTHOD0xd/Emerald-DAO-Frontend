'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { PropertyCard, PropertyData } from './PropertyCard';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { 
  Input, 
  Button, 
  Badge, 
  LoadingState, 
  SkeletonCard 
} from '@/components/ui';

interface PropertyGridProps {
  properties: PropertyData[];
  loading?: boolean;
  error?: string;
}

type SortField = 'value' | 'rent' | 'roi' | 'acquisitionDate' | 'address';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'Residential' | 'Commercial' | 'Industrial' | 'Mixed-Use';
type ViewMode = 'grid' | 'list';

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  loading = false,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(property => property.propertyType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'value':
          aValue = a.estimatedValue;
          bValue = b.estimatedValue;
          break;
        case 'rent':
          aValue = a.monthlyRent;
          bValue = b.monthlyRent;
          break;
        case 'roi':
          aValue = a.roiPercentage;
          bValue = b.roiPercentage;
          break;
        case 'acquisitionDate':
          aValue = new Date(a.acquisitionDate).getTime();
          bValue = new Date(b.acquisitionDate).getTime();
          break;
        case 'address':
          aValue = a.address;
          bValue = b.address;
          break;
        default:
          aValue = a.estimatedValue;
          bValue = b.estimatedValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [properties, searchTerm, sortField, sortOrder, filterType]);

  const handlePropertyClick = (property: PropertyData) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const propertyTypeOptions: FilterType[] = ['all', 'Residential', 'Commercial', 'Industrial', 'Mixed-Use'];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search properties by address, city, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={20} />}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          {/* Property Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {propertyTypeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="value">Value</option>
              <option value="rent">Rent</option>
              <option value="roi">ROI</option>
              <option value="acquisitionDate">Date Acquired</option>
              <option value="address">Address</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </Button>
          </div>

          {/* View Mode */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">
            {filteredAndSortedProperties.length} of {properties.length} properties
          </p>
          {searchTerm && (
            <Badge variant="info">
              Searching: "{searchTerm}"
            </Badge>
          )}
          {filterType !== 'all' && (
            <Badge variant="emerald">
              {filterType}
            </Badge>
          )}
        </div>
      </div>

      {/* Property Grid/List */}
      <LoadingState loading={loading}>
        {filteredAndSortedProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No properties found matching your criteria.</p>
            {(searchTerm || filterType !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredAndSortedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => handlePropertyClick(property)}
              />
            ))}
          </div>
        )}
      </LoadingState>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};