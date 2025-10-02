import * as React from 'react';
import {
  Container, Paper, Stack, Typography, Button, Snackbar, Alert, Divider
} from '@mui/material';
import http from '../api/http.jsx';
import ProductTable from '../components/ProductTable';
import ProductFormDialog from '../components/ProductFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProductsPage() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [confirm, setConfirm] = React.useState({ open: false, product: null });

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await http.get('/product'); // GET /api/product
      setRows(data);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCreateClick = () => { setEditing(null); setOpenForm(true); };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        // PATCH partiel
        const id = editing._id;
        const { data } = await http.patch(`/product/${id}`, payload);
        setRows(arr => arr.map(x => (x._id === id ? data : x)));
        setSuccessMsg('Produit mis à jour');
      } else {
        const { data } = await http.post('/product', payload);
        setRows((arr) => [data, ...arr]);
        setSuccessMsg('Produit créé');
      }
      setOpenForm(false);
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  const handleEdit = (p) => { setEditing(p); setOpenForm(true); };

  const handleDelete = (p) => { setConfirm({ open: true, product: p }); };

  const confirmDelete = async () => {
    const p = confirm.product;
    try {
      await http.delete(`/product/${p._id}`);
      setRows((arr) => arr.filter((x) => x._id !== p._id));
      setSuccessMsg('Produit supprimé');
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setConfirm({ open: false, product: null });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Produits</Typography>
          <Button variant="contained" onClick={handleCreateClick}>Nouveau</Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {loading ? (
          <Typography variant="body2" color="text.secondary">Chargement…</Typography>
        ) : (
          <ProductTable rows={rows} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Paper>

      {/* Dialogs */}
      <ProductFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        initial={editing || {}}
        showId={!editing} // si ton backend exige _id à la création
      />

      <ConfirmDialog
        open={confirm.open}
        title="Supprimer le produit"
        content={`Supprimer "${confirm.product?.name}" ?`}
        onCancel={() => setConfirm({ open: false, product: null })}
        onConfirm={confirmDelete}
      />

      {/* Notifications */}
      <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg('')}>
        <Alert severity="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>
      </Snackbar>
      <Snackbar open={!!successMsg} autoHideDuration={2500} onClose={() => setSuccessMsg('')}>
        <Alert severity="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
      </Snackbar>
    </Container>
  );
}
