import { HarvestListing, Grade } from '../types';
import { MOCK_LISTINGS } from '../constants';

const DB_KEY = 'yieldsync_local_db_v1';

/**
 * LOCAL DATABASE SERVICE
 * Replaces Supabase with browser LocalStorage to simulate a persisted SQL database.
 */

// Helper: Initialize DB if empty
const initDB = (): HarvestListing[] => {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    // Seed database with mock data
    localStorage.setItem(DB_KEY, JSON.stringify(MOCK_LISTINGS));
    return MOCK_LISTINGS;
  }
  return JSON.parse(existing);
};

// Helper: Save to DB
const saveDB = (data: HarvestListing[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

/**
 * Fetch all listings (SELECT * FROM listings)
 */
export const getListings = async (): Promise<HarvestListing[]> => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const data = initDB();
  // Sort by ID descending (mocking created_at)
  return data.reverse(); 
};

/**
 * Get a single listing by ID (SELECT * FROM listings WHERE id = ?)
 */
export const getListingById = async (id: string): Promise<HarvestListing | undefined> => {
  const data = initDB();
  return data.find(l => l.id === id);
};

/**
 * Add a new listing (INSERT INTO listings...)
 */
export const addListing = async (listingData: Omit<HarvestListing, 'id' | 'saturationLevel'>): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const currentData = initDB();

  const newListing: HarvestListing = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...listingData,
    saturationLevel: 'medium', // Default logic
    imageUrl: `https://source.unsplash.com/random/400x300/?${listingData.cropType}`
  };

  // Add to beginning of array (newest first)
  const updatedData = [...currentData, newListing];
  saveDB(updatedData);
  
  console.log("Record inserted into Local DB:", newListing);
};
