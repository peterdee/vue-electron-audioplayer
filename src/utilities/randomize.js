/**
 * Randomize array elements (Durstenfeld shuffle)
 * @param {*[]} array - array of objects
 * @returns {*[]}
 */
export default (array = []) => {
  const mutable = [...array];
  for (let i = mutable.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [mutable[i], mutable[j]] = [mutable[j], mutable[i]];
  }
  return mutable;
};
