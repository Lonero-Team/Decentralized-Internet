export default data => {
  // reset cart subtotal based on items list
  data.subtotal = 0
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i]
    data.subtotal += item.quantity * (item.final_price || item.price)
  }
  return data
}
