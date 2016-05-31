export default function createFindCache (change$) {
  return (fn) =>
    change$.flatMap(fn)
}

