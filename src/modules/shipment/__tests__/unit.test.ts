import { describe, it, expect } from 'vitest';
import { haversine } from '../helpers/haversine';

// ─── haversine ─────────────────────────────────────────────────

describe('haversine', () => {
  it('misma coordenada = 0 km', () => {
    expect(haversine(19.4326, -99.1332, 19.4326, -99.1332)).toBe(0);
  });

  it('CDMX a Monterrey ≈ 750-780 km', () => {
    const dist = haversine(19.4326, -99.1332, 25.6866, -100.3161);
    expect(dist).toBeGreaterThan(700);
    expect(dist).toBeLessThan(800);
  });

  it('distancias cortas (< 5km) son razonables', () => {
    // ~1 km de diferencia aprox
    const dist = haversine(19.4326, -99.1332, 19.4416, -99.1332);
    expect(dist).toBeGreaterThan(0.5);
    expect(dist).toBeLessThan(2);
  });

  it('distancia es simétrica (A→B = B→A)', () => {
    const ab = haversine(19.4326, -99.1332, 25.6866, -100.3161);
    const ba = haversine(25.6866, -100.3161, 19.4326, -99.1332);
    expect(ab).toBeCloseTo(ba, 5);
  });
});
