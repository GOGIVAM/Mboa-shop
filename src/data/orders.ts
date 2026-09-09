export type OrderStatus = 'pending' | 'preparing' | 'in_transit' | 'delivered';
export type MissionStatus = 'pending' | 'accepted' | 'picked_up' | 'delivered';

export interface OrderLine { name: string; size?: string; quantity: number; price: number; }

export interface DemoOrder {
  ref: string;
  pin: string;
  status: OrderStatus;
  customer: string;
  phone: string;
  city: string;
  address: string;
  total: number;
  placedAt: string;
  courier: { name: string; vehicle: string; rating: number; etaMinutes: number };
  /** Trajet du livreur, du point d'enlèvement vers le client. */
  track: { lat: number; lng: number }[];
  lines: OrderLine[];
}

/** Coordonnées réelles de Yaoundé, pour la carte de suivi. */
export const ORDERS: DemoOrder[] = [
  {
    ref: 'MB-2049', pin: '4271', status: 'in_transit',
    customer: 'Awa Mbarga', phone: '+237 6 78 45 12 09',
    city: 'Yaoundé', address: 'Bastos, rue 1.842, immeuble Akwa, 2e étage',
    total: 31900, placedAt: '2026-09-09T08:15:00',
    courier: { name: 'Serge Etoa', vehicle: 'Moto — YAO 4821 B', rating: 4.8, etaMinutes: 12 },
    track: [
      { lat: 3.8480, lng: 11.5021 },
      { lat: 3.8562, lng: 11.5104 },
      { lat: 3.8641, lng: 11.5188 },
      { lat: 3.8718, lng: 11.5232 },
    ],
    lines: [
      { name: 'Robe longue coton imprimé, ceinture nouée', size: 'M', quantity: 1, price: 17900 },
      { name: 'Sac cabas toile et cuir', quantity: 1, price: 21000 },
    ],
  },
  {
    ref: 'MB-2044', pin: '8137', status: 'preparing',
    customer: 'Jean-Paul Nkoulou', phone: '+237 6 55 09 88 41',
    city: 'Douala', address: 'Bonapriso, rue Njo-Njo, villa 14',
    total: 45000, placedAt: '2026-09-09T07:02:00',
    courier: { name: 'Ariane Mbella', vehicle: 'Moto — DLA 1190 C', rating: 4.9, etaMinutes: 38 },
    track: [{ lat: 4.0483, lng: 9.7043 }, { lat: 4.0421, lng: 9.7128 }],
    lines: [{ name: 'Blazer croisé laine mélangée', size: 'L', quantity: 1, price: 45000 }],
  },
  {
    ref: 'MB-2031', pin: '5502', status: 'delivered',
    customer: 'Chantal Fotso', phone: '+237 6 91 23 44 70',
    city: 'Bafoussam', address: 'Quartier Tamdja, face pharmacie du Marché',
    total: 12500, placedAt: '2026-09-07T14:40:00',
    courier: { name: 'Bruno Kamdem', vehicle: 'Moto — BAF 0455 A', rating: 4.7, etaMinutes: 0 },
    track: [{ lat: 5.4781, lng: 10.4176 }],
    lines: [{ name: 'Chemise en wax coupe droite, manches longues', size: 'M', quantity: 1, price: 12500 }],
  },
];

export interface DemoMission {
  id: string;
  orderRef: string;
  pin: string;
  status: MissionStatus;
  pickup: string;
  dropoff: string;
  city: string;
  distanceKm: number;
  earnings: number;
  customer: string;
  phone: string;
  coords: { pickup: { lat: number; lng: number }; dropoff: { lat: number; lng: number } };
}

export const MISSIONS: DemoMission[] = [
  {
    id: 'LIV-8801', orderRef: 'MB-2049', pin: '4271', status: 'picked_up',
    pickup: 'Atelier Ngoa — Mvog-Mbi, rue 3.088',
    dropoff: 'Bastos, rue 1.842, immeuble Akwa',
    city: 'Yaoundé', distanceKm: 6.4, earnings: 1500,
    customer: 'Awa Mbarga', phone: '+237 6 78 45 12 09',
    coords: { pickup: { lat: 3.8480, lng: 11.5021 }, dropoff: { lat: 3.8718, lng: 11.5232 } },
  },
  {
    id: 'LIV-8802', orderRef: 'MB-2052', pin: '9044', status: 'pending',
    pickup: 'Maison Kribi — Mokolo, entrée sud',
    dropoff: 'Nlongkak, rue 2.114, résidence Essos',
    city: 'Yaoundé', distanceKm: 4.1, earnings: 1200,
    customer: 'Félix Owona', phone: '+237 6 70 11 55 32',
    coords: { pickup: { lat: 3.8760, lng: 11.5104 }, dropoff: { lat: 3.8891, lng: 11.5261 } },
  },
  {
    id: 'LIV-8803', orderRef: 'MB-2053', pin: '3318', status: 'accepted',
    pickup: 'Bantu Denim — Biyem-Assi, carrefour TAM',
    dropoff: 'Odza, rue des Manguiers, lot 22',
    city: 'Yaoundé', distanceKm: 9.8, earnings: 2100,
    customer: 'Nadine Bikoï', phone: '+237 6 82 47 90 15',
    coords: { pickup: { lat: 3.8318, lng: 11.4762 }, dropoff: { lat: 3.7994, lng: 11.5408 } },
  },
  {
    id: 'LIV-8798', orderRef: 'MB-2040', pin: '1207', status: 'delivered',
    pickup: 'Mboa Print — Mvan, zone industrielle',
    dropoff: 'Ngousso, rue 4.501',
    city: 'Yaoundé', distanceKm: 7.2, earnings: 1650,
    customer: 'Éric Tchoumi', phone: '+237 6 99 30 21 88',
    coords: { pickup: { lat: 3.8102, lng: 11.5197 }, dropoff: { lat: 3.8949, lng: 11.5378 } },
  },
];

export interface DemoSeller {
  id: string; shopName: string; owner: string; city: string;
  status: 'active' | 'pending' | 'cancelled'; items: number; sales: number; joinedAt: string;
}

export const SELLERS: DemoSeller[] = [
  { id: 'V-101', shopName: 'Atelier Ngoa', owner: 'Estelle Ngoa', city: 'Yaoundé', status: 'active', items: 148, sales: 2_340_000, joinedAt: '2025-11-04' },
  { id: 'V-102', shopName: 'Maison Kribi', owner: 'Paul Ebolo', city: 'Douala', status: 'active', items: 96, sales: 1_810_000, joinedAt: '2026-01-22' },
  { id: 'V-103', shopName: 'Bantu Denim', owner: 'Sandra Njoya', city: 'Yaoundé', status: 'active', items: 61, sales: 1_204_000, joinedAt: '2026-02-15' },
  { id: 'V-104', shopName: 'Kmer Kicks', owner: 'Yann Bilong', city: 'Douala', status: 'pending', items: 0, sales: 0, joinedAt: '2026-09-06' },
  { id: 'V-105', shopName: 'Sahel Couture', owner: 'Amina Bello', city: 'Bafoussam', status: 'active', items: 44, sales: 688_000, joinedAt: '2026-04-30' },
  { id: 'V-106', shopName: 'Douala Tailoring', owner: 'Régine Same', city: 'Douala', status: 'cancelled', items: 12, sales: 96_000, joinedAt: '2026-03-11' },
];
