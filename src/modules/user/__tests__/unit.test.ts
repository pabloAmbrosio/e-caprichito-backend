import { describe, it, expect } from 'vitest';
import { assertNotSelf } from '../helpers/guards/assert-not-self';

// ─── assertNotSelf ─────────────────────────────────────────────

describe('assertNotSelf', () => {
  it('mismo ID lanza error', () => {
    expect(() => assertNotSelf('abc-123', 'abc-123')).toThrow();
  });

  it('IDs diferentes no lanza', () => {
    expect(() => assertNotSelf('abc-123', 'def-456')).not.toThrow();
  });
});
