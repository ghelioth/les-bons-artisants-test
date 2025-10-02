import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, FormControlLabel, Switch, Rating
} from '@mui/material';

/**
 * Formulaire création/édition.
 * Si ton backend EXIGE _id numérique à la création, laisse "showId" à true.
 * Si tu as l’auto-incrément côté serveur, passe showId={false}.
 */
import PropTypes from 'prop-types';

export default function ProductFormDialog({
  open, onClose, onSubmit, initial = {}, showId = true
}) {
  const [form, setForm] = React.useState({
    _id: initial._id ?? '',
    name: initial.name ?? '',
    type: initial.type ?? '',
    price: initial.price ?? '',
    rating: initial.rating ?? 0,
    warranty_years: initial.warranty_years ?? '',
    available: initial.available ?? true,
  });

  React.useEffect(() => {
    setForm({
      _id: initial._id ?? '',
      name: initial.name ?? '',
      type: initial.type ?? '',
      price: initial.price ?? '',
      rating: initial.rating ?? 0,
      warranty_years: initial.warranty_years ?? '',
      available: initial.available ?? true,
    });
  }, [initial, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSwitch = (e) => {
    setForm((s) => ({ ...s, available: e.target.checked }));
  };

  const handleRating = (_e, value) => {
    setForm((s) => ({ ...s, rating: value ?? 0 }));
  };

  const handleSubmit = () => {
    // conversions -> nombres/booleans cohérents
    const payload = {
      ...form,
      price: form.price === '' ? '' : Number(form.price),
      rating: Number(form.rating),
      warranty_years: form.warranty_years === '' ? '' : parseInt(form.warranty_years, 10),
    };
    if (showId && form._id !== '') payload._id = Number(form._id);
    onSubmit(payload);
  };

  const isEdit = Boolean(initial && Object.keys(initial).length);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {showId && !isEdit && (
            <Grid item xs={12} sm={6}>
              <TextField
                label="ID (nombre)"
                name="_id"
                value={form._id}
                onChange={handleChange}
                fullWidth
                type="number"
                required
              />
            </Grid>
          )}
          <Grid item xs={12} sm={showId && !isEdit ? 6 : 12}>
            <TextField
              label="Nom"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Prix (€)"
              name="price"
              value={form.price}
              onChange={handleChange}
              fullWidth
              type="number"
              inputProps={{ step: '0.01' }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Note</div>
              <Rating name="rating" value={Number(form.rating) || 0} precision={0.5} onChange={handleRating} />
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Garantie (années)"
              name="warranty_years"
              value={form.warranty_years}
              onChange={handleChange}
              fullWidth
              type="number"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={!!form.available} onChange={handleSwitch} />}
              label="Disponible"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEdit ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ProductFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initial: PropTypes.object,
  showId: PropTypes.bool
};
