import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import VenueCard from '../../components/venue/VenueCard';
import { COLORS } from '../../constants/colors';
import { SPORTS, SportItem } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import { searchVenues, setSearchQuery } from '../../store/slices/venueSlice';
import { ExploreStackParamList, SportType, Venue } from '../../types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreScreen'>;

interface FilterState {
  sportType: SportType | null;
  maxDistance: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

const DISTANCE_OPTIONS = [
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: 'Any', value: null },
];

const PRICE_RANGES = [
  { label: 'Under 500', min: 0, max: 500 },
  { label: '500 - 1000', min: 500, max: 1000 },
  { label: '1000 - 2000', min: 1000, max: 2000 },
  { label: '2000+', min: 2000, max: null },
  { label: 'Any Price', min: null, max: null },
];

const ExploreScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { venues, searchQuery, loading, pagination } = useSelector(
    (state: RootState) => state.venues
  );

  const [filters, setFilters] = useState<FilterState>({
    sportType: null,
    maxDistance: null,
    minPrice: null,
    maxPrice: null,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  const performSearch = useCallback(
    (query?: string, filterOverride?: FilterState) => {
      const activeFilters = filterOverride || filters;
      dispatch(
        searchVenues({
          query: query !== undefined ? query : searchQuery,
          sportType: activeFilters.sportType || undefined,
          radius: activeFilters.maxDistance || undefined,
          minPrice: activeFilters.minPrice || undefined,
          maxPrice: activeFilters.maxPrice || undefined,
          latitude: 12.9716,
          longitude: 77.5946,
          page: 1,
          limit: 20,
        })
      );
    },
    [dispatch, searchQuery, filters]
  );

  useEffect(() => {
    performSearch();
  }, []);

  const handleSearchChange = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const handleSearchSubmit = () => {
    performSearch(searchQuery);
  };

  const handleSearchClear = () => {
    dispatch(setSearchQuery(''));
    performSearch('');
  };

  const handleSportFilter = (sportId: SportType) => {
    const newSport = filters.sportType === sportId ? null : sportId;
    const newFilters = { ...filters, sportType: newSport };
    setFilters(newFilters);
    performSearch(undefined, newFilters);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
    performSearch(undefined, tempFilters);
  };

  const handleResetFilters = () => {
    const resetState: FilterState = {
      sportType: null,
      maxDistance: null,
      minPrice: null,
      maxPrice: null,
    };
    setTempFilters(resetState);
    setFilters(resetState);
    setShowFilterModal(false);
    performSearch(undefined, resetState);
  };

  const handleVenuePress = (venue: Venue) => {
    navigation.navigate('VenueDetail', { venueId: venue.id });
  };

  const handleMapView = () => {
    navigation.navigate('MapView');
  };

  const activeFilterCount = [
    filters.sportType,
    filters.maxDistance,
    filters.minPrice || filters.maxPrice,
  ].filter(Boolean).length;

  const renderVenueItem = ({ item }: { item: Venue }) => (
    <View style={styles.venueItemWrapper}>
      <VenueCard venue={item} onPress={() => handleVenuePress(item)} />
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Sport Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportChipContainer}
      >
        {SPORTS.map((sport: SportItem) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportChip,
              filters.sportType === sport.id && styles.sportChipActive,
              filters.sportType === sport.id && {
                backgroundColor: sport.color,
                borderColor: sport.color,
              },
            ]}
            onPress={() => handleSportFilter(sport.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.sportEmoji}>{sport.emoji}</Text>
            <Text
              style={[
                styles.sportChipText,
                filters.sportType === sport.id && styles.sportChipTextActive,
              ]}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count and map toggle */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          {pagination.total} venue{pagination.total !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity
          style={styles.mapToggleButton}
          onPress={handleMapView}
          activeOpacity={0.7}
        >
          <Icon name="map-outline" size={18} color={COLORS.primary} />
          <Text style={styles.mapToggleText}>Map View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="map-search-outline"
        title="No Venues Found"
        message="Try adjusting your search or filters to find venues near you."
        actionLabel="Clear Filters"
        onAction={handleResetFilters}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearchChange}
        placeholder="Search venues, sports..."
        showFilter
        onFilterPress={() => {
          setTempFilters(filters);
          setShowFilterModal(true);
        }}
        onClear={handleSearchClear}
        style={styles.searchBar}
      />

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersRow}>
          {filters.sportType && (
            <TouchableOpacity
              style={styles.activeFilterBadge}
              onPress={() => handleSportFilter(filters.sportType!)}
            >
              <Text style={styles.activeFilterText}>
                {SPORTS.find((s) => s.id === filters.sportType)?.name}
              </Text>
              <Icon name="close" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {filters.maxDistance && (
            <View style={styles.activeFilterBadge}>
              <Text style={styles.activeFilterText}>
                Within {filters.maxDistance} km
              </Text>
            </View>
          )}
          {(filters.minPrice !== null || filters.maxPrice !== null) && (
            <View style={styles.activeFilterBadge}>
              <Text style={styles.activeFilterText}>
                {filters.minPrice && filters.maxPrice
                  ? `${filters.minPrice} - ${filters.maxPrice}`
                  : filters.minPrice
                  ? `${filters.minPrice}+`
                  : `Under ${filters.maxPrice}`}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Venue List */}
      {loading && venues.length === 0 ? (
        <LoadingSpinner fullScreen message="Searching venues..." />
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item) => item.id}
          renderItem={renderVenueItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (
              !loading &&
              pagination.page < pagination.totalPages
            ) {
              dispatch(
                searchVenues({
                  query: searchQuery,
                  sportType: filters.sportType || undefined,
                  radius: filters.maxDistance || undefined,
                  minPrice: filters.minPrice || undefined,
                  maxPrice: filters.maxPrice || undefined,
                  latitude: 12.9716,
                  longitude: 77.5946,
                  page: pagination.page + 1,
                  limit: 20,
                })
              );
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && venues.length > 0 ? (
              <LoadingSpinner size="small" style={styles.footerSpinner} />
            ) : null
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Distance Filter */}
            <Text style={styles.filterSectionTitle}>Distance</Text>
            <View style={styles.filterOptionsRow}>
              {DISTANCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.filterOption,
                    tempFilters.maxDistance === option.value &&
                      styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    setTempFilters({ ...tempFilters, maxDistance: option.value })
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      tempFilters.maxDistance === option.value &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Filter */}
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.filterOptionsRow}>
              {PRICE_RANGES.map((range) => {
                const isActive =
                  tempFilters.minPrice === range.min &&
                  tempFilters.maxPrice === range.max;
                return (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.filterOption,
                      isActive && styles.filterOptionActive,
                    ]}
                    onPress={() =>
                      setTempFilters({
                        ...tempFilters,
                        minPrice: range.min,
                        maxPrice: range.max,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        isActive && styles.filterOptionTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sport Type Filter */}
            <Text style={styles.filterSectionTitle}>Sport Type</Text>
            <View style={styles.filterOptionsRow}>
              {SPORTS.map((sport: SportItem) => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.filterOption,
                    tempFilters.sportType === sport.id &&
                      styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    setTempFilters({
                      ...tempFilters,
                      sportType:
                        tempFilters.sportType === sport.id ? null : sport.id,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      tempFilters.sportType === sport.id &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {sport.emoji} {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Reset"
              onPress={handleResetFilters}
              variant="outline"
              style={styles.modalFooterBtn}
            />
            <Button
              title="Apply Filters"
              onPress={handleApplyFilters}
              variant="primary"
              style={[styles.modalFooterBtn, styles.applyBtn]}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    paddingTop: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  sportChipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  sportChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  sportChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  sportChipTextActive: {
    color: COLORS.white,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    gap: 4,
  },
  mapToggleText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  venueItemWrapper: {
    paddingHorizontal: 16,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
  // Filter Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  modalFooterBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});

export default ExploreScreen;
