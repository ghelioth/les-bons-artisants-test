import * as React from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Tooltip, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';

export default function ProductTable({ rows, onEdit, onDelete }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Nom</TableCell>
          <TableCell>Type</TableCell>
          <TableCell align="right">Prix (€)</TableCell>
          <TableCell align="center">Note</TableCell>
          <TableCell align="center">Garantie (ans)</TableCell>
          <TableCell align="center">Dispo</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((p, i) => (
          <TableRow key={p?._id != null ? `prod-${p._id}` : `tmp-${i}-${p?.name ?? 'no-name'}`} hover>
            <TableCell>{p._id}</TableCell>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.type}</TableCell>
            <TableCell align="right">{Number.isFinite(Number(p.price)) ? Number(p.price).toFixed(2) : '-'}</TableCell>
            <TableCell align="center">{p.rating}</TableCell>
            <TableCell align="center">{p.warranty_years ?? '-'}</TableCell>
            <TableCell align="center">
              {p.available ? <Chip label="Oui" color="success" size="small" /> : <Chip label="Non" color="default" size="small" />}
            </TableCell>
            <TableCell align="right">
              <Tooltip title="Modifier">
                <IconButton onClick={() => onEdit(p)}><EditIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Supprimer">
                <IconButton color="error" onClick={() => onDelete(p)}><DeleteIcon /></IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary' }}>
              Aucun produit
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

ProductTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    type: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    warranty_years: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    available: PropTypes.bool,
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
