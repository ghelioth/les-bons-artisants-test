import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import http from '../../api/http';
import { normalizeProduct } from '../../utils/normalize';

// === Entity adapter ===
const productsAdapter = createEntityAdapter({
  selectId: (p) => Number(p._id),
  sortComparer: (a, b) => Number(a._id) - Number(b._id),
});

// === Thunks HTTP ===
export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  const { data } = await http.get('/product');
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
});

export const createProduct = createAsyncThunk('products/create', async (payload) => {
  const { data } = await http.post('/product', payload);
  const prod = normalizeProduct(data);
  if (prod._id == null) throw new Error("POST: API n’a pas renvoyé _id");
  return prod;
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, changes }) => {
  const { data } = await http.patch(`/product/${id}`, changes);
  const prod = normalizeProduct(data);
  if (prod._id == null) throw new Error("PATCH: API n’a pas renvoyé _id");
  return prod;
});

export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
  await http.delete(`/product/${id}`);
  return Number(id);
});

// === Actions déclenchées par WS ===
const wsCreated = (payload) => ({ type: 'products/wsCreated', payload });
const wsUpdated = (payload) => ({ type: 'products/wsUpdated', payload });
const wsDeleted = (payload) => ({ type: 'products/wsDeleted', payload });

export const productsWs = { wsCreated, wsUpdated, wsDeleted };

// === Slice ===
const initialState = productsAdapter.getInitialState({
  status: 'idle',
  error: null,
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        productsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load';
      });

    // create
    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        productsAdapter.upsertOne(state, action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // update
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        productsAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // delete
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        productsAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // === WebSocket ===
    builder
      .addCase('products/wsCreated', (state, action) => {
        const n = normalizeProduct(action.payload);
        if (n._id != null) productsAdapter.upsertOne(state, n);
      })
      .addCase('products/wsUpdated', (state, action) => {
        const n = normalizeProduct(action.payload);
        if (n._id != null) productsAdapter.upsertOne(state, n);
      })
      .addCase('products/wsDeleted', (state, action) => {
        const id = Number(action.payload?._id ?? action.payload);
        if (Number.isFinite(id)) productsAdapter.removeOne(state, id);
      });
  },
});

export default productsSlice.reducer;

// === Selectors ===
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
} = productsAdapter.getSelectors((state) => state.products);
export const selectProductsStatus = (state) => state.products.status;
export const selectProductsError = (state) => state.products.error;
