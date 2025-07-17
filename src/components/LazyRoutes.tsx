
import { lazy } from 'react';

// Route-level lazy loading for optimal code splitting
export const LazyBills = lazy(() => import('../pages/Bills').then(module => ({ default: module.default })));
export const LazyMembers = lazy(() => import('../pages/Members').then(module => ({ default: module.default })));
export const LazyCommittees = lazy(() => import('../pages/Committees').then(module => ({ default: module.default })));
export const LazyChangeLog = lazy(() => import('../pages/ChangeLog').then(module => ({ default: module.default })));
export const LazyChats = lazy(() => import('../pages/Chats').then(module => ({ default: module.default })));
export const LazyFavorites = lazy(() => import('../pages/Favorites').then(module => ({ default: module.default })));
export const LazyPlayground = lazy(() => import('../pages/Playground').then(module => ({ default: module.default })));
export const LazyPlans = lazy(() => import('../pages/Plans').then(module => ({ default: module.default })));
export const LazyProfile = lazy(() => import('../pages/Profile').then(module => ({ default: module.default })));
export const LazyIndex = lazy(() => import('../pages/Index').then(module => ({ default: module.default })));

// Chat functionality split into separate chunk - fix the export handling
export const LazyChatSheet = lazy(() => import('./AIChatSheet').then(module => ({
  default: module.AIChatSheet
})));
