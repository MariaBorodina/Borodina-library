import { getSeedBookCountByRealm } from './book.seed';
import { Realm } from '../../shared/models/realm.model';

const SEED_REALM_DATA = [
  {
    id: '1',
    slug: 'hard-sci-fi',
    name: 'Hard Sci-Fi',
    description: 'Stories grounded in rigorous science and plausible futures.',
  },
  {
    id: '2',
    slug: 'space-opera',
    name: 'Space Opera',
    description: 'Epic adventures across galaxies and civilizations.',
  },
  {
    id: '3',
    slug: 'epic-fantasy',
    name: 'Epic Fantasy',
    description: 'Sweeping quests through kingdoms of magic and myth.',
  },
  {
    id: '4',
    slug: 'urban-fantasy',
    name: 'Urban Fantasy',
    description: 'The supernatural woven into modern city life.',
  },
  {
    id: '5',
    slug: 'cyberpunk',
    name: 'Cyberpunk Wastelands',
    description: 'Neon-lit dystopias where technology and humanity collide.',
  },
  {
    id: '6',
    slug: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: 'Terrifying glimpses beyond human comprehension.',
  },
  {
    id: '7',
    slug: 'solarpunk',
    name: 'Solarpunk',
    description: 'Hopeful futures built on ecology and community.',
  },
  {
    id: '8',
    slug: 'dragon-realms',
    name: 'Dragon Realms',
    description: 'Ancient wyrms, lost hoards, and fire-bound legends.',
  },
  {
    id: '9',
    slug: 'time-travel-archives',
    name: 'Time Travel Archives',
    description: 'Chronicles that bend the timeline and rewrite history.',
  },
] as const;

export function getSeedRealms(): Realm[] {
  return SEED_REALM_DATA.map((realm) => ({
    ...realm,
    bookCount: getSeedBookCountByRealm(realm.id),
  }));
}

/** Seed realms with published book counts derived from seed books. */
export const SEED_REALMS: Realm[] = getSeedRealms();

export interface HomeRealmPill {
  label: string;
  /** null routes to the full browse page (/realms) */
  slug: string | null;
}

/** Home page category pills mapped to realm routes */
export const HOME_REALM_PILLS: HomeRealmPill[] = [
  { label: 'All Realms', slug: null },
  { label: 'Hard Sci-Fi', slug: 'hard-sci-fi' },
  { label: 'Space Opera', slug: 'space-opera' },
  { label: 'Epic Fantasy', slug: 'epic-fantasy' },
  { label: 'Urban Fantasy', slug: 'urban-fantasy' },
  { label: 'Cyberpunk', slug: 'cyberpunk' },
  { label: 'Cosmic Horror', slug: 'cosmic-horror' },
  { label: 'Solarpunk', slug: 'solarpunk' },
];
