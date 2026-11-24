/**
 * Fisher-Yates array shuffle (pure and non-mutating)
 */
export function shuffleArray<T>(array: T[], seed?: number): T[] {
  const copy = [...array];
  let m = copy.length;
  let t: T;
  let i: number;

  // Optional pseudo-random if seed is provided
  let random = Math.random;
  if (seed !== undefined) {
    let s = seed;
    random = () => {
      const x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };
  }

  while (m) {
    i = Math.floor(random() * m--);
    t = copy[m];
    copy[m] = copy[i];
    copy[i] = t;
  }
  return copy;
}
