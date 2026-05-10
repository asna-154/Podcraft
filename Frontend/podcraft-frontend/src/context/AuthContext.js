import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('podcraft_token'));

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await getMe();
                    setUser(res.data.user);
                } catch (error) {
                    localStorage.removeItem('podcraft_token');
                    localStorage.removeItem('podcraft_user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = (userData, userToken) => {
        localStorage.setItem('podcraft_token', userToken);
        localStorage.setItem('podcraft_user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('podcraft_token');
        localStorage.removeItem('podcraft_user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('podcraft_user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            token,
            login,
            logout,
            updateUser,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);