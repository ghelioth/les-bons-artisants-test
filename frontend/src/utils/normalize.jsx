// normalise un produit (évite null/undefined, force les nombres)
export const normalizeProduct = (p = {}) => ({
  _id: p._id != null ? Number(p._id) : undefined,
  name: p.name ?? '',
  type: p.type ?? '',
  price: p.price != null ? Number(p.price) : 0,
  rating: p.rating != null ? Number(p.rating) : 0,
  warranty_years: p.warranty_years ?? null,
  available: !!p.available,
});

// remplace ou insère par _id, en filtrant les trous
export const replaceById = (list, raw) => {
  const item = normalizeProduct(raw);
  if (item._id == null || Number.isNaN(item._id)) {
    return list.filter(Boolean);
  }
  const id = Number(item._id);
  const arr = list.filter(Boolean);
  const idx = arr.findIndex(x => x && Number(x._id) === id);
  if (idx === -1) return [item, ...arr];
  const copy = arr.slice();
  copy[idx] = { ...arr[idx], ...item, _id: id };
  return copy;
};