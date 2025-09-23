export function detectSuddenSpike(painSeries: number[], threshold = 3) {
  // Returns index of spike or -1
  for (let i = 1; i < painSeries.length; i++) {
    if (painSeries[i] - painSeries[i - 1] >= threshold) return i;
  }
  return -1;
}
