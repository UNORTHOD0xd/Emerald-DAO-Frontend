'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Grid, List, RefreshCw, BarChart3 } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { 
  Input, 
  Button, 
  Badge, 
  LoadingState, 
  SkeletonCard 
} from '@/components/ui';
import { usePropertyData, PropertyData } from '@/hooks/usePropertyData';
import { useRealPropertyData, RealPropertyData } from '@/hooks/useRealPropertyData';

interface PropertyGridProps {
  showPortfolioMetrics?: boolean;
  onPropertySelect?: (property: PropertyData) => void;
}

type SortField = 'value' | 'rent' | 'roi' | 'acquisitionDate' | 'address';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'Residential' | 'Commercial' | 'Industrial' | 'Mixed-Use';
type ViewMode = 'grid' | 'list';

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  showPortfolioMetrics = true,
  onPropertySelect,
}) => {
  // Try to use real contract data first, fallback to mock data
  const realData = useRealPropertyData();
  const mockData = usePropertyData();
  
  // Use real data if available and has properties, otherwise use mock data
  const useRealData = realData.hasRealData && !realData.shouldUseMockData;
  
  const { 
    properties, 
    portfolioMetrics, 
    isLoading, 
    error, 
    refreshProperties, 
    lastRefresh,
    hasProperties,
    activeProperties,
    pendingProperties,
    underReviewProperties 
  } = useRealData ? realData : mockData;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    onPropertySelect?.(property);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProperties();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        <Button onClick={handleRefresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Metrics */}
      {showPortfolioMetrics && hasProperties && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 size={20} className="text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Portfolio Overview</h2>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolioMetrics.totalValue)}
              </p>
              <p className="text-sm text-gray-600">Total Portfolio Value</p>
              <p className="text-xs text-emerald-600 mt-1">
                +{formatCurrency(portfolioMetrics.totalAppreciation)} appreciation
              </p>
            </div>
            
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolioMetrics.totalMonthlyRent)}
              </p>
              <p className="text-sm text-gray-600">Monthly Rental Income</p>
              <p className="text-xs text-blue-600 mt-1">
                {formatCurrency(portfolioMetrics.totalMonthlyRent * 12)}/year
              </p>
            </div>
            
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-gray-900">
                {portfolioMetrics.averageROI.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600">Average ROI</p>
              <p className="text-xs text-gray-500 mt-1">
                {portfolioMetrics.averageConfidenceScore.toFixed(0)}% avg confidence
              </p>
            </div>
            
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-gray-900">
                {properties.length}
              </p>
              <p className="text-sm text-gray-600">Total Properties</p>
              <div className="flex justify-center lg:justify-start space-x-2 mt-1">
                <Badge variant="success" size="sm">{activeProperties} Active</Badge>
                {pendingProperties > 0 && (
                  <Badge variant="warning" size="sm">{pendingProperties} Pending</Badge>
                )}
                {underReviewProperties > 0 && (
                  <Badge variant="info" size="sm">{underReviewProperties} Review</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Portfolio</h1>
          <p className="text-gray-600">
            Manage and monitor your real estate investments
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={useRealData ? 'success' : 'info'} size="sm">
              {useRealData ? '🔗 Live Contract Data' : '📋 Demo Data'}
            </Badge>
            {useRealData && (
              <span className="text-xs text-gray-500">
                {realData.totalProperties} properties on-chain
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          leftIcon={
            <RefreshCw 
              size={16} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
          }
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
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
      <LoadingState loading={isLoading && properties.length === 0}>
        {filteredAndSortedProperties.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {properties.length === 0 
                ? "No properties in portfolio yet. Start by creating acquisition proposals!"
                : "No properties found matching your criteria."
              }
            </p>
            {(searchTerm || filterType !== 'all') && properties.length > 0 && (
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
      {isLoading && properties.length === 0 && (
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