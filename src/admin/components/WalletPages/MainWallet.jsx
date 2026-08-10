import React from 'react';
import WalletReportTable from './WalletReportTable';

const MainWallet = () => {
    const sampleData = []; 

  return (
    <WalletReportTable 
      title="Main Wallet Report" 
      data={sampleData} 
    />
  );
};

export default MainWallet;
