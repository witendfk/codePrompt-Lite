/**
 * 数组累加方法
 * @param {number[]} arr - 要累加的数字数组
 * @returns {number} 累加后的总和
 */
export function sumArray(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  return arr.reduce((sum, current) => sum + current, 0);
}
