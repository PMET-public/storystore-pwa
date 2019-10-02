export const getTotalCartQuantity = (items: Array<{ quantity: number }>) =>
    items.reduce((total, item) => total + item.quantity, 0)
