// Central place for formatting money as Indian Rupees across the app.

export function formatPrice(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}
