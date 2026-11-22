export const LAVA_CAST = ['lava-host', 'lava-guest', 'lava-customer'] as const;
export type LavaId = typeof LAVA_CAST[number];
export const LAVA_CAMERAS = [
  'lava-stall', 'lava-reaction', 'lava-lever', 'lava-channel', 'lava-channel-detail',
  'lava-chicken', 'lava-solo', 'lava-ensemble', 'lava-belt', 'lava-platter',
] as const;
export type LavaView = typeof LAVA_CAMERAS[number];
