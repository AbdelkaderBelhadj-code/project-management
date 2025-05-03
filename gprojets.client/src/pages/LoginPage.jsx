import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import '../styles/LoginPage.css';
import taskImage from '../assets/task2.jpg';
import logo from '../assets/logo.png'; // ajoutez un logo ici

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setEmail('');
        setPassword('');
        setError('');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Email et mot de passe sont requis.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5035/api/User/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Échec de la connexion');
            }

            const data = await response.json();

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);
                const role = data.user.role.toLowerCase();

                if (role === 'admin' || role === 'administrateur') {
                    navigate('/app');
                } else if (role === 'chef de projet' || role === 'chef') {
                    navigate('/app');
                } else {
                    navigate('/app');
                }
            } else {
                setError('Identifiants incorrects.');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError('Une erreur est survenue. Veuillez réessayer plus tard.');
        }
    };

    return (
        <Grid container component="main" className="login-root">
            <Grid item xs={false} sm={6} md={7} className="login-image">
                <img src={taskImage} alt="Login Visual" className="image-content" />
            </Grid>

            <Grid item xs={12} sm={6} md={5} className="login-box">
                <Box className="form-container">
                    <img src={logo} alt="Logo" className="logo-animated" style={{ height: 60, margin: '0 auto 20px', display: 'block' }} />

                    <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
                        GProjets
                    </Typography>
                    <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
                        Bienvenue ! Veuillez vous connecter à votre compte.
                    </Typography>

                    {error && (
                        <Typography color="error" align="center" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={!!error}
                            InputProps={{ style: { borderRadius: 10 } }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Mot de passe"
                            type="password"
                            id="password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={!!error}
                            InputProps={{ style: { borderRadius: 10 } }}
                        />

                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <FormControlLabel control={<Checkbox />} label="Se souvenir de moi" />
                            <Typography variant="body2">
                                <a href="/forgot-password">Mot de passe oublié ?</a>
                            </Typography>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                borderRadius: 10,
                                py: 1.2,
                                background: 'linear-gradient(135deg, #2196f3, #21cbf3)',
                                boxShadow: '0 4px 20px rgba(33, 203, 243, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #21cbf3, #2196f3)',
                                },
                            }}
                        >
                            Connexion
                        </Button>
                    </form>
                </Box>
            </Grid>
        </Grid>
    );
}

export default LoginPage;
