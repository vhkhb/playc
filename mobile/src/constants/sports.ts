import { SportType } from '../types';

export interface SportItem {
  id: SportType;
  name: string;
  icon: string;
  color: string;
  emoji: string;
}

export const SPORTS: SportItem[] = [
  {
    id: 'cricket',
    name: 'Cricket',
    icon: 'cricket',
    color: '#4CAF50',
    emoji: '\uD83C\uDFCF',
  },
  {
    id: 'football',
    name: 'Football',
    icon: 'soccer-ball-o',
    color: '#2196F3',
    emoji: '\u26BD',
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: 'badminton',
    color: '#FF9800',
    emoji: '\uD83C\uDFF8',
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: 'tennis',
    color: '#CDDC39',
    emoji: '\uD83C\uDFBE',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: 'basketball',
    color: '#FF5722',
    emoji: '\uD83C\uDFC0',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    icon: 'swim',
    color: '#00BCD4',
    emoji: '\uD83C\uDFCA',
  },
  {
    id: 'table_tennis',
    name: 'Table Tennis',
    icon: 'table-tennis',
    color: '#E91E63',
    emoji: '\uD83C\uDFD3',
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    icon: 'volleyball',
    color: '#9C27B0',
    emoji: '\uD83C\uDFD0',
  },
  {
    id: 'hockey',
    name: 'Hockey',
    icon: 'hockey-puck',
    color: '#607D8B',
    emoji: '\uD83C\uDFD1',
  },
  {
    id: 'squash',
    name: 'Squash',
    icon: 'squash',
    color: '#795548',
    emoji: '\uD83C\uDFBE',
  },
];

export const getSportById = (id: SportType): SportItem | undefined =>
  SPORTS.find((s) => s.id === id);

export const getSportName = (id: SportType): string =>
  getSportById(id)?.name || id;

export const getSportColor = (id: SportType): string =>
  getSportById(id)?.color || '#4CAF50';

export const SPORT_OPTIONS = SPORTS.map((s) => ({
  label: s.name,
  value: s.id,
}));
