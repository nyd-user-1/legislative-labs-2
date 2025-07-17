
import { lazy } from 'react';

// Route-level lazy loading for optimal code splitting
export const LazyBills = lazy(() => import('../pages/Bills'));
export const LazyMembers = lazy(() => import('../pages/Members'));
export const LazyCommittees = lazy(() => import('../pages/Committees'));
export const LazyChangeLog = lazy(() => import('../pages/ChangeLog'));
export const LazyChats = lazy(() => import('../pages/Chats'));
export const LazyFavorites = lazy(() => import('../pages/Favorites'));
export const LazyPlayground = lazy(() => import('../pages/Playground'));
export const LazyPlans = lazy(() => import('../pages/Plans'));
export const LazyProfile = lazy(() => import('../pages/Profile'));
export const LazyIndex = lazy(() => import('../pages/Index'));

// Chat functionality split into separate chunk
export const LazyChatSheet = lazy(() => import('./AIChatSheet'));
