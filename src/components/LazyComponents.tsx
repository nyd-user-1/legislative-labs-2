
import { lazy } from 'react';

// Lazy load heavy detail components
export const LazyBillDetail = lazy(() => import('./BillDetail').then(module => ({
  default: module.BillDetail
})));

export const LazyMemberDetail = lazy(() => import('./MemberDetail').then(module => ({
  default: module.MemberDetail
})));

export const LazyCommitteeDetail = lazy(() => import('./CommitteeDetail').then(module => ({
  default: module.CommitteeDetail
})));

export const LazyAIChatSheet = lazy(() => import('./AIChatSheet').then(module => ({
  default: module.AIChatSheet
})));
