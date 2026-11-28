export const BTS_TWO_CAST = [
  'bts-two-lead', 'bts-two-low', 'bts-two-bright', 'bts-two-mid',
  'bts-two-edge', 'bts-two-air', 'bts-two-warm',
] as const;

export const BTS_TWO = {
  id: 'bts-2-point-0',
  title: 'BTS · 2.0',
  eyebrow: 'PHYSICAL VOICES · ELEVATOR, CORRIDOR AND LOBBY',
  description: 'Seven suited performers emerge from a freight elevator into a fluorescent concrete corridor. The choreography moves through a tiled washroom and a glass-fronted lobby before the record spins out.',
  names: ['Voice 1', 'Voice 2', 'Voice 3', 'Voice 4', 'Voice 5', 'Voice 6', 'Voice 7'],
  female: [.13, .06, .28, .19, .12, .37, .25],
  child: [.004, .001, .016, .009, .003, .018, .011],
  bpm: 132,
  source: '_gyultVTesk',
  shots: [
    [0, 'bts-lift-indicator'], [7.174, 'bts-corridor-silhouette'], [9.593, 'bts-lift-indicator'],
    [16.141, 'bts-corridor-silhouette'], [17.935, 'bts-entrance'], [20.8, 'bts-lift-ensemble'],
    [23.524, 'bts-lift-portrait'], [25.359, 'bts-lift-portrait'], [27.194, 'bts-lift-portrait'],
    [29.112, 'bts-lift-portrait'], [30.781, 'bts-lift-portrait'], [34.159, 'bts-lift-portrait'],
    [38.33, 'bts-side-ensemble'], [67.943, 'bts-side-tracking'], [68.944, 'bts-side-ensemble'],
    [91.508, 'bts-corridor-ensemble'], [97.25, 'bts-corridor-close'], [105.4, 'bts-corridor-ensemble'],
    [118, 'bts-corridor-silhouette'], [134.468, 'bts-washroom-ensemble'], [137.012, 'bts-washroom-overhead'],
    [144.478, 'bts-lift-overhead'], [152.6, 'bts-lift-ensemble'], [158.575, 'bts-lobby-portrait'],
    [164.25, 'bts-lobby-ensemble'], [171.4, 'bts-corridor-close'], [182, 'bts-washroom-ensemble'],
    [194.403, 'bts-lobby-portrait'], [195.404, 'bts-lobby-ensemble'], [204.25, 'bts-lobby-tracking'],
    [213.4, 'bts-lobby-ensemble'], [221.1, 'bts-lobby-tracking'], [227.352, 'bts-record'],
  ],
} as const;

export type BtsTwoView = typeof BTS_TWO.shots[number][1];

export const isBtsTwoInsert = (view: unknown) => view === 'bts-lift-indicator' || view === 'bts-record';
