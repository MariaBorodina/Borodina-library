import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Realm } from '../../shared/models/realm.model';

const SEED_REALMS: Realm[] = [
  {
    id: '1',
    slug: 'hard-sci-fi',
    name: 'Hard Sci-Fi',
    description: 'Stories grounded in rigorous science and plausible futures.',
    bookCount: 12,
  },
  {
    id: '2',
    slug: 'space-opera',
    name: 'Space Opera',
    description: 'Epic adventures across galaxies and civilizations.',
    bookCount: 18,
  },
  {
    id: '3',
    slug: 'epic-fantasy',
    name: 'Epic Fantasy',
    description: 'Sweeping quests through kingdoms of magic and myth.',
    bookCount: 24,
  },
  {
    id: '4',
    slug: 'urban-fantasy',
    name: 'Urban Fantasy',
    description: 'The supernatural woven into modern city life.',
    bookCount: 9,
  },
  {
    id: '5',
    slug: 'cyberpunk',
    name: 'Cyberpunk Wastelands',
    description: 'Neon-lit dystopias where technology and humanity collide.',
    bookCount: 14,
  },
  {
    id: '6',
    slug: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: 'Terrifying glimpses beyond human comprehension.',
    bookCount: 7,
  },
  {
    id: '7',
    slug: 'solarpunk',
    name: 'Solarpunk',
    description: 'Hopeful futures built on ecology and community.',
    bookCount: 6,
  },
  {
    id: '8',
    slug: 'dragon-realms',
    name: 'Dragon Realms',
    description: 'Ancient wyrms, lost hoards, and fire-bound legends.',
    bookCount: 11,
  },
  {
    id: '9',
    slug: 'time-travel-archives',
    name: 'Time Travel Archives',
    description: 'Chronicles that bend the timeline and rewrite history.',
    bookCount: 0,
  },
];

@Injectable({ providedIn: 'root' })
export class RealmService {
  getRealms(): Observable<Realm[]> {
    return of(SEED_REALMS).pipe(delay(150));
  }

  getRealmBySlug(slug: string): Observable<Realm | undefined> {
    return of(SEED_REALMS.find((realm) => realm.slug === slug));
  }
}
