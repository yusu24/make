import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  JasaCategoryType, 
  JasaTerms, 
  JasaCategoryInfo, 
  getJasaTerms, 
  JASA_CATEGORIES_LIST 
} from '../hooks/useJasaTerms';

interface JasaContextType {
  category: JasaCategoryType;
  terms: JasaTerms;
  setCategory: (newCategory: JasaCategoryType) => void;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  categoriesList: JasaCategoryInfo[];
}

const STORAGE_KEY = 'bizora_jasa_category';

const JasaContext = createContext<JasaContextType | undefined>(undefined);

export const JasaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [category, setCategoryState] = useState<JasaCategoryType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && JASA_CATEGORIES_LIST.some(c => c.id === saved)) {
      return saved as JasaCategoryType;
    }
    return 'elektronik';
  });

  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const [terms, setTerms] = useState<JasaTerms>(() => getJasaTerms(category));

  useEffect(() => {
    setTerms(getJasaTerms(category));
  }, [category]);

  const setCategory = (newCategory: JasaCategoryType) => {
    setCategoryState(newCategory);
    localStorage.setItem(STORAGE_KEY, newCategory);
    setTerms(getJasaTerms(newCategory));
    setIsPickerOpen(false);
  };

  const openPicker = () => setIsPickerOpen(true);
  const closePicker = () => setIsPickerOpen(false);

  return (
    <JasaContext.Provider
      value={{
        category,
        terms,
        setCategory,
        isPickerOpen,
        openPicker,
        closePicker,
        categoriesList: JASA_CATEGORIES_LIST,
      }}
    >
      {children}
    </JasaContext.Provider>
  );
};

export const useJasa = () => {
  const context = useContext(JasaContext);
  if (!context) {
    throw new Error('useJasa must be used within a JasaProvider');
  }
  return context;
};
