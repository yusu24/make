import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook to manage Core System data (Dashboard, Products, Transactions)
 */
export const useCore = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // GET /api/dashboard
    const getDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/dashboard');
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat dashboard');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // GET /api/products
    const getProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat produk');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // POST /api/products
    const createProduct = async (productData) => {
        setLoading(true);
        try {
            const res = await api.post('/products', productData);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat produk');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // GET /api/transactions
    const getTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/transactions');
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat transaksi');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // POST /api/retail/pos
    const processPosTransaction = async (posData) => {
        setLoading(true);
        try {
            const res = await api.post('/retail/pos', posData);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memproses POS');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getDashboard,
        getProducts,
        createProduct,
        getTransactions,
        processPosTransaction
    };
};
