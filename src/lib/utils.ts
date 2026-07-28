export function unsplashUrl(id: string, { w = 1200, q = 75 }: { w?: number; q?: number } = {}) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;
}
