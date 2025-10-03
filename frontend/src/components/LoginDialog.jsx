import * as React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Link, Typography } from "@mui/material";
import http, { setToken } from "../api/http";


export default function LoginDialog({ open, onClose, onLoginSuccess }) {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSignup, setIsSignup] = React.useState(false);

  const submit  = async () => {
    try {
        setError("");
        const endpoint = isSignup ? '/auth/register' : '/auth/login';
        const payload = isSignup ? { email, password, name } : { email, password };
        const { data } = await http.post(endpoint, payload);
        setToken(data.token);
        onLoginSuccess?.(data.user);
        onClose();
    } catch (err) {
        setError(err.message);
    }
};

return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isSignup ? "Créer un compte" : "Se connecter"}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {isSignup && (
            <TextField
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
            />
          )}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            autoFocus={!isSignup}
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          {error && <Typography variant="body2" color="error">{error}</Typography>}

          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {isSignup ? "Déjà un compte ?" : "Pas de compte ?"}{' '}
            <Link component="button" onClick={() => setIsSignup((v) => !v)}>
              {isSignup ? 'Se connecter' : 'Créer un compte'}
            </Link>
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={submit}>
          {isSignup ? 'Créer et se connecter' : 'Se connecter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
LoginDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func,
};