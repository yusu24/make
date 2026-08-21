import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../../services/api';
import { getBudidayaTerms } from '../hooks/useBudidayaTerms';

export const BudidayaContext = createContext();

export const useBudidayaContext = () => useContext(BudidayaContext);

export const BudidayaProvider = ({ children }) => {
  const [farmType, setFarmType] = useState('ikan');
  const [farmName, setFarmName] = useState('');
  const [terms, setTerms] = useState(getBudidayaTerms('ikan'));
  const [loadingSettings, setLoadingSettings] = useState(true);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/budidaya/settings');
      if (data?.data) {
        const payload = data.data;
        const settingObj = payload.setting || payload;
        const rawType = payload.category || settingObj.farming_category || settingObj.farm_type || 'ikan';
        setFarmType(rawType);
        setFarmName(settingObj.farm_name || '');
        setTerms(getBudidayaTerms(rawType));
      }
    } catch (error) {
      console.error('Failed to load budidaya settings', error);
      // Fallback
      setTerms(getBudidayaTerms('ikan'));
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateFarmSettings = async (newType, newName) => {
    try {
      await api.post('/budidaya/settings', { farm_type: newType, farm_name: newName });
      setFarmType(newType);
      setFarmName(newName);
      setTerms(getBudidayaTerms(newType));
      return true;
    } catch (error) {
      console.error('Failed to update budidaya settings', error);
      throw error;
    }
  };

  return (
    <BudidayaContext.Provider value={{ farmType, farmName, terms, updateFarmSettings, loadingSettings }}>
      {children}
    </BudidayaContext.Provider>
  );
};
