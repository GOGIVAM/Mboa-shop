import { ORDERS, MISSIONS, SELLERS, DemoOrder, DemoMission, DemoSeller, MissionStatus } from '../data/orders';

/**
 * Accès aux commandes, missions et vendeurs — jeu de démonstration.
 * Pour brancher le backend, remplacez le corps de chaque fonction :
 *
 *   findOrderByPin  ->  POST /api/orders/track      { pin }
 *   placeOrder      ->  POST /api/orders            { customer, payment, items }
 *   listMissions    ->  GET  /api/deliveries/mine
 *   advanceMission  ->  POST /api/deliveries/:id/status
 *   listSellers     ->  GET  /api/admin/sellers
 */

const LATENCY_MS = 420;

function delay<T>(value: T, signal?: AbortSignal, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => resolve(value), ms);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export async function findOrderByPin(pin: string, signal?: AbortSignal): Promise<DemoOrder | null> {
  const clean = pin.trim();
  return delay(ORDERS.find(o => o.pin === clean) ?? null, signal, 700);
}

export async function findOrderByRef(ref: string, signal?: AbortSignal): Promise<DemoOrder | null> {
  return delay(ORDERS.find(o => o.ref.toLowerCase() === ref.trim().toLowerCase()) ?? null, signal);
}

export interface PlaceOrderInput {
  fullName: string; phone: string; city: string; address: string;
  payment: 'momo' | 'om' | 'card' | 'cash';
  momoNumber?: string;
  total: number;
}

export interface PlacedOrder { ref: string; pin: string; paymentRef: string; }

export async function placeOrder(input: PlaceOrderInput, signal?: AbortSignal): Promise<PlacedOrder> {
  const ref = `MB-${2000 + Math.floor(Math.random() * 900)}`;
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const paymentRef = input.payment === 'cash'
    ? '—'
    : `NP-${Math.floor(1000 + Math.random() * 9000)}`;
  return delay({ ref, pin, paymentRef }, signal, 1200);
}

export async function listMissions(signal?: AbortSignal): Promise<DemoMission[]> {
  return delay([...MISSIONS], signal);
}

const NEXT: Record<MissionStatus, MissionStatus> = {
  pending: 'accepted',
  accepted: 'picked_up',
  picked_up: 'delivered',
  delivered: 'delivered',
};

export function nextMissionStatus(status: MissionStatus): MissionStatus {
  return NEXT[status];
}

export async function advanceMission(id: string, signal?: AbortSignal): Promise<MissionStatus> {
  const mission = MISSIONS.find(m => m.id === id);
  if (!mission) throw new Error('Mission introuvable');
  return delay(nextMissionStatus(mission.status), signal, 600);
}

export async function listSellers(signal?: AbortSignal): Promise<DemoSeller[]> {
  return delay([...SELLERS], signal);
}

export async function listOrders(signal?: AbortSignal): Promise<DemoOrder[]> {
  return delay([...ORDERS], signal);
}

export async function submitSellerApplication(signal?: AbortSignal): Promise<{ id: string }> {
  return delay({ id: `V-${100 + Math.floor(Math.random() * 900)}` }, signal, 1100);
}
