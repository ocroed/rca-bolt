import { create } from 'zustand';
import type { RCA, User, Equipment, Location, Department } from '../types/models';
import { api } from '../services/api';

interface AppState {
  // RCA state
  rcas: RCA[];
  activeIncidents: RCA[];
  loadingRCAs: boolean;
  
  // Reference data
  users: User[];
  equipment: Equipment[];
  locations: Location[];
  departments: Department[];
  
  // Actions
  fetchActiveIncidents: () => Promise<void>;
  fetchRCAs: () => Promise<void>;
  createRCA: (data: Partial<RCA>) => Promise<void>;
  updateRCA: (id: string, data: Partial<RCA>) => Promise<void>;
  
  // Reference data actions
  fetchUsers: () => Promise<void>;
  fetchEquipment: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  fetchDepartments: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  rcas: [],
  activeIncidents: [],
  loadingRCAs: false,
  users: [],
  equipment: [],
  locations: [],
  departments: [],
  
  // Actions
  fetchActiveIncidents: async () => {
    set({ loadingRCAs: true });
    try {
      const incidents = await api.rca.getActiveIncidents();
      set({ activeIncidents: incidents });
    } finally {
      set({ loadingRCAs: false });
    }
  },
  
  fetchRCAs: async () => {
    set({ loadingRCAs: true });
    try {
      const rcas = await api.rca.getAll();
      set({ rcas });
    } finally {
      set({ loadingRCAs: false });
    }
  },
  
  createRCA: async (data) => {
    await api.rca.create(data);
    get().fetchRCAs();
  },
  
  updateRCA: async (id, data) => {
    await api.rca.update(id, data);
    get().fetchRCAs();
  },
  
  // Reference data fetching
  fetchUsers: async () => {
    const users = await api.users.getAll();
    set({ users });
  },
  
  fetchEquipment: async () => {
    const equipment = await api.equipment.getAll();
    set({ equipment });
  },
  
  fetchLocations: async () => {
    const locations = await api.locations.getAll();
    set({ locations });
  },
  
  fetchDepartments: async () => {
    const departments = await api.departments.getAll();
    set({ departments });
  },
}));