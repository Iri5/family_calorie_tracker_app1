import { useTranslation } from 'react-i18next';
import { Product } from '../types';

export const useProductName = () => {
  const { i18n } = useTranslation();

  const getProductName = (product: Product): string => {
    return i18n.language === 'ru' ? product.name : product.nameEn || product.name;
  };

  return { getProductName };
};