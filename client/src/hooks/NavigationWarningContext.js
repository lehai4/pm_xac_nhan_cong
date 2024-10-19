import React, { createContext, useState, useContext } from 'react';

const NavigationWarningContext = createContext();

export const NavigationWarningProvider = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningData, setWarningData] = useState(null);

  return (
    <NavigationWarningContext.Provider value={{ showWarning, setShowWarning, warningData, setWarningData }}>
      {children}
    </NavigationWarningContext.Provider>
  );
};

export const useNavigationWarningContext = () => useContext(NavigationWarningContext);