import React, { useState } from 'react';
//import styles from '../popupCreateActivity.module.css';

const NumberInput = ({ initialValue = 0, onChange }) => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <input type="number" value={value} onChange={handleChange} style={{ 
            marginLeft: '5%',
            width: '5%'
        }} />
    );
};

export default NumberInput;