export const useCurrency = () => {
  const formatCurrency = (value, currency = 'TRY', locale = 'tr-TR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  return {
    formatCurrency,
  };
};
