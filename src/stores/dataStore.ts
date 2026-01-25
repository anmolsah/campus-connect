import { create } from 'zustand';
import type { Profile, Connection, Post, Message } from '../types';

interface PostWithAuthor extends Post {
  author: Profile;
  is_liked: boolean;
  is_saved: boolean;
}

interface ConnectionWithProfile extends Connection {
  other_user: Profile;
  last_message?: Message;
  unread_count?: number;
}

interface DataState {
  discoveryProfiles: Profile[];
  discoveryConnections: Connection[];
  discoveryLastFetched: number | null;

  feedPosts: PostWithAuthor[];
  feedLastFetched: number | null;
  feedMode: string | null;

  chatConnections: ConnectionWithProfile[];
  chatPendingRequests: ConnectionWithProfile[];
  chatsLastFetched: number | null;

  setDiscoveryData: (profiles: Profile[], connections: Connection[]) => void;
  setFeedData: (posts: PostWithAuthor[], mode: string) => void;
  setChatData: (connections: ConnectionWithProfile[], pending: ConnectionWithProfile[]) => void;

  updateDiscoveryConnection: (connection: Connection) => void;
  updateFeedPost: (postId: string, updates: Partial<PostWithAuthor>) => void;
  addFeedPost: (post: PostWithAuthor) => void;

  clearAllData: () => void;

  shouldRefetchDiscovery: (mode: string, campus: boolean, userCampus: string | null) => boolean;
  shouldRefetchFeed: (mode: string) => boolean;
  shouldRefetchChats: () => boolean;
}

const CACHE_DURATION = 30000;

export const useDataStore = create<DataState>((set, get) => ({
  discoveryProfiles: [],
  discoveryConnections: [],
  discoveryLastFetched: null,

  feedPosts: [],
  feedLastFetched: null,
  feedMode: null,

  chatConnections: [],
  chatPendingRequests: [],
  chatsLastFetched: null,

  setDiscoveryData: (profiles, connections) => set({
    discoveryProfiles: profiles,
    discoveryConnections: connections,
    discoveryLastFetched: Date.now(),
  }),

  setFeedData: (posts, mode) => set({
    feedPosts: posts,
    feedLastFetched: Date.now(),
    feedMode: mode,
  }),

  setChatData: (connections, pending) => set({
    chatConnections: connections,
    chatPendingRequests: pending,
    chatsLastFetched: Date.now(),
  }),

  updateDiscoveryConnection: (connection) => set((state) => ({
    discoveryConnections: [...state.discoveryConnections.filter(c => c.id !== connection.id), connection],
  })),

  updateFeedPost: (postId, updates) => set((state) => ({
    feedPosts: state.feedPosts.map(post =>
      post.id === postId ? { ...post, ...updates } : post
    ),
  })),

  addFeedPost: (post) => set((state) => ({
    feedPosts: [post, ...state.feedPosts],
  })),

  clearAllData: () => set({
    discoveryProfiles: [],
    discoveryConnections: [],
    discoveryLastFetched: null,
    feedPosts: [],
    feedLastFetched: null,
    feedMode: null,
    chatConnections: [],
    chatPendingRequests: [],
    chatsLastFetched: null,
  }),

  shouldRefetchDiscovery: (mode, campus, userCampus) => {
    const state = get();
    if (!state.discoveryLastFetched) return true;
    if (Date.now() - state.discoveryLastFetched > CACHE_DURATION) return true;
    return false;
  },

  shouldRefetchFeed: (mode) => {
    const state = get();
    if (!state.feedLastFetched) return true;
    if (state.feedMode !== mode) return true;
    if (Date.now() - state.feedLastFetched > CACHE_DURATION) return true;
    return false;
  },

  shouldRefetchChats: () => {
    const state = get();
    if (!state.chatsLastFetched) return true;
    if (Date.now() - state.chatsLastFetched > CACHE_DURATION) return true;
    return false;
  },
}));
