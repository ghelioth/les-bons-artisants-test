import * as React from 'react';
import socket, { connectSocket } from '../tempsReel/socket.jsx';
import {
  Container, Paper, Stack, Typography, Button, Snackbar, Alert, Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAllProducts, selectProductsStatus, selectProductsError,
  fetchProducts, createProduct, updateProduct, deleteProduct,
  productsWs
} from '../features/products/productsSlice';
import { getToken, setToken } from '../api/http.jsx';
import ProductTable from '../components/ProductTable';
import ProductFormDialog from '../components/ProductFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginDialog from '../components/LoginDialog.jsx';


export default function ProductsPage() {
  const dispatch = useDispatch();

  // Redux state
  const rows = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);
  const loadError = useSelector(selectProductsError);

  // Local state
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [confirm, setConfirm] = React.useState({ open: false, product: null });
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [canWrite, setCanWrite] = React.useState(!!getToken());

  // Charger au mount
  React.useEffect(() => {
    dispatch(fetchProducts())
      .unwrap()
      .catch((err) => setErrorMsg(err.message));
  }, [dispatch]);

  // Reporter les erreurs de chargement Redux
  React.useEffect(() => {
    if (loadError) setErrorMsg(loadError);
  }, [loadError]);


  React.useEffect(() => {
    if (getToken()) {
      connectSocket();
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setLoginOpen(false);
    setCanWrite(true);
    connectSocket();
    setSuccessMsg(`Connecté ${user?.email || ''}`);
  };

  
  const onLogout = () => {
    setToken(null);
    setCanWrite(false);
    socket.disconnect();
    setSuccessMsg('Déconnecté');
  };

  const requireAuth = () => {
    if (!getToken()) {
      setLoginOpen(true);
      setErrorMsg('Veuillez vous connecter');
      return false;
    }
    return true;
  };

  // const fetchProducts = React.useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const { data } = await http.get('/product'); // GET /api/product
  //     setRows(Array.isArray(data) ? data.filter(Boolean).map(normalizeProduct) : []);
  //   } catch (e) {
  //     setErrorMsg(e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // React.useEffect(() => { fetchProducts(); }, [fetchProducts]);


  // --- WebSocket -> Redux ---
  React.useEffect(() => {
    const onConnect = () => console.log('connected', socket.id);
    const onDisconnect = () => console.log('disconnected');

    socket.onAny((event, payload) => {
      if (event.startsWith('product:')) {
        console.log('[ws]', event, payload && payload._id, typeof payload?._id);
      }
    });

    const onCreated = (p) => dispatch(productsWs.wsCreated(p));
    const onUpdated = (p) => dispatch(productsWs.wsUpdated(p));
    const onDeleted = (p) => dispatch(productsWs.wsDeleted(p));

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('product:created', onCreated);
    socket.on('product:updated', onUpdated);
    socket.on('product:deleted', onDeleted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('product:created', onCreated);
      socket.off('product:updated', onUpdated);
      socket.off('product:deleted', onDeleted);
    };
  }, [dispatch]);

  // Les Actions
  const handleCreateClick = () => { if (!requireAuth()) return;
    setEditing(null); setOpenForm(true); };

  const handleSubmit = async (payload) => {
    try {
      if (!requireAuth()) return;

      if (editing) {
        await dispatch(updateProduct({ id: editing._id, changes: payload })).unwrap();
        setSuccessMsg('Produit mis à jour');
      } else {
        await dispatch(createProduct(payload)).unwrap();
        setSuccessMsg('Produit créé');
      }
      setOpenForm(false);
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  const handleEdit = (p) => { if (!requireAuth()) return; setEditing(p); setOpenForm(true); };

  const handleDelete = (p) => { if (!requireAuth()) return; setConfirm({ open: true, product: p }); };

  const confirmDelete = async () => {
    try {
      if (!requireAuth()) return;
      await dispatch(deleteProduct(confirm.product._id)).unwrap();
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
          <Stack direction="row" spacing={1}>
            {!canWrite ? (
              <Button variant="outlined" onClick={() => setLoginOpen(true)}>Se connecter</Button>
            ) : (
              <Button variant="outlined" onClick={onLogout}>Se déconnecter</Button>
            )}
            {canWrite && (
              <Button variant="contained" onClick={handleCreateClick}>Nouveau</Button>
            )}
          </Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {status === 'loading' ? (
          <Typography variant="body2" color="text.secondary">Chargement…</Typography>
        ) : (
          <ProductTable
            rows={rows}
            canWrite={canWrite}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Paper>

      {/* Dialogs */}
      <ProductFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        initial={editing || {}}
        showId={!editing}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Supprimer le produit"
        content={`Supprimer "${confirm.product?.name}" ?`}
        onCancel={() => setConfirm({ open: false, product: null })}
        onConfirm={confirmDelete}
      />

      
      {/* Login Dialog */}
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
