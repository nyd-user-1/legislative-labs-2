
import { lazy } from 'react';

// Route-level lazy loading with proper error boundaries
export const LazyBills = lazy(() => 
  import('../pages/Bills')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Bills component:', error);
      throw error;
    })
);

export const LazyMembers = lazy(() => 
  import('../pages/Members')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Members component:', error);
      throw error;
    })
);

export const LazyCommittees = lazy(() => 
  import('../pages/Committees')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Committees component:', error);
      throw error;
    })
);

export const LazyChangeLog = lazy(() => 
  import('../pages/ChangeLog')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load ChangeLog component:', error);
      throw error;
    })
);

export const LazyChats = lazy(() => 
  import('../pages/Chats')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Chats component:', error);
      throw error;
    })
);

export const LazyFavorites = lazy(() => 
  import('../pages/Favorites')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Favorites component:', error);
      throw error;
    })
);

export const LazyPlayground = lazy(() => 
  import('../pages/Playground')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Playground component:', error);
      throw error;
    })
);

export const LazyPlans = lazy(() => 
  import('../pages/Plans')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Plans component:', error);
      throw error;
    })
);

export const LazyProfile = lazy(() => 
  import('../pages/Profile')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Profile component:', error);
      throw error;
    })
);

export const LazyIndex = lazy(() => 
  import('../pages/Index')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Index component:', error);
      throw error;
    })
);

// Chat functionality with proper error handling
export const LazyChatSheet = lazy(() => 
  import('./AIChatSheet')
    .then(module => ({ default: module.AIChatSheet }))
    .catch(error => {
      console.error('Failed to load AIChatSheet component:', error);
      throw error;
    })
);
