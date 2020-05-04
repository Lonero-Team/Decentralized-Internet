export default item => {
  // fix item quantity if needed
  // use minimun quantity 1 by default
  const min = item.min_quantity || 1
  const max = item.max_quantity
  if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity < min) {
    item.quantity = min
  } else if (max && item.quantity > max) {
    item.quantity = max
  }
  return item
}
