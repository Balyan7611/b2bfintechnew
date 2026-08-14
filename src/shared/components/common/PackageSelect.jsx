import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import SearchableSelect from './SearchableSelect';

const PackageSelect = ({ value, onChange, placeholder = "Select Package", style = {} }) => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const pkgRes = await API.package.getAll();
        let arr = [];
        if (Array.isArray(pkgRes)) {
            arr = pkgRes;
        } else if (pkgRes && Array.isArray(pkgRes.data)) {
            arr = pkgRes.data;
        } else if (pkgRes && pkgRes.data && Array.isArray(pkgRes.data.items)) {
            arr = pkgRes.data.items;
        } else if (pkgRes && Array.isArray(pkgRes.items)) {
            arr = pkgRes.items;
        }

        setPackages(arr);
      } catch (err) {
        console.error("Error loading packages in PackageSelect component:", err);
      }
    };
    fetchPackages();
  }, []);

  return (
    <SearchableSelect
      value={value || ""}
      onChange={onChange}
      options={[
        { label: placeholder, value: '' },
        ...packages.map(p => ({ label: p.name, value: p.id }))
      ]}
      placeholder={placeholder}
      style={{ height: '48px', ...style }}
    />
  );
};

export default PackageSelect;
