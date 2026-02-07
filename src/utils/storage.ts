import Store from 'electron-store';

export interface UserSettings {
  qwenApiKey?: string;
  defaultPreset?: string;
  outputDirectory?: string;
  autoSave?: boolean;
  imageQuality?: number;
}

export interface ProcessHistory {
  id: string;
  timestamp: number;
  inputPath: string;
  outputPath: string;
  presetId: string;
  presetName: string;
}

interface StoreSchema {
  settings: UserSettings;
  history: ProcessHistory[];
}

const schema = {
  settings: {
    type: 'object',
    properties: {
      qwenApiKey: { type: 'string' },
      defaultPreset: { type: 'string' },
      outputDirectory: { type: 'string' },
      autoSave: { type: 'boolean' },
      imageQuality: { type: 'number', minimum: 1, maximum: 100 }
    },
    default: {
      autoSave: true,
      imageQuality: 95
    }
  },
  history: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        timestamp: { type: 'number' },
        inputPath: { type: 'string' },
        outputPath: { type: 'string' },
        presetId: { type: 'string' },
        presetName: { type: 'string' }
      },
      required: ['id', 'timestamp', 'inputPath', 'outputPath', 'presetId', 'presetName']
    },
    default: []
  }
} as const;

export const store = new Store<StoreSchema>({
  schema: schema as any,
  name: 'id-photo-config'
});

export function getSettings(): UserSettings {
  return store.get('settings', {
    autoSave: true,
    imageQuality: 95
  });
}

export function updateSettings(settings: Partial<UserSettings>): void {
  const current = getSettings();
  store.set('settings', { ...current, ...settings });
}

export function getSetting<K extends keyof UserSettings>(
  key: K
): UserSettings[K] | undefined {
  const settings = getSettings();
  return settings[key];
}

export function setSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K]
): void {
  const settings = getSettings();
  settings[key] = value;
  store.set('settings', settings);
}

export function getHistory(): ProcessHistory[] {
  return store.get('history', []);
}

export function addHistoryItem(item: Omit<ProcessHistory, 'id' | 'timestamp'>): void {
  const history = getHistory();
  const newItem: ProcessHistory = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };
  
  history.unshift(newItem);
  
  if (history.length > 100) {
    history.splice(100);
  }
  
  store.set('history', history);
}

export function clearHistory(): void {
  store.set('history', []);
}

export function deleteHistoryItem(id: string): void {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  store.set('history', filtered);
}

export function getHistoryByPreset(presetId: string): ProcessHistory[] {
  const history = getHistory();
  return history.filter(item => item.presetId === presetId);
}

export function resetStore(): void {
  store.clear();
}
