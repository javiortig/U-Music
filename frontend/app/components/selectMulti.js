import React from 'react';
import Select from 'react-select';

const SelectMulti = ({ options, onChange, value, placeholder, styles}) => {
  return (
    <Select
      isMulti
      options={options}
      value={value}
      onChange={onChange}      
      placeholder={placeholder}
      styles={styles}
    />
  );
};  

export default SelectMulti;