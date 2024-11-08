'use client';

import { useState } from 'react';
import styles from '../perfil.module.css';

const AddInstrumentDropdown = ({ userInstruments, allInstruments, onAdd }) => {
  const [selectedInstrument, setSelectedInstrument] = useState('');
  
  const handleAdd = () => {
    if (selectedInstrument) {
      onAdd(selectedInstrument);
      setSelectedInstrument('');
    }
  };

  return (
    <div className={styles.addInstrument}>
      <select value={selectedInstrument} onChange={(e) => setSelectedInstrument(e.target.value)}>
        <option value="">Selecciona un instrumento</option>
        {allInstruments.map((instrument) => (
          <option key={instrument} value={instrument} disabled={userInstruments.includes(instrument)}>
            {instrument}
          </option>
        ))}
      </select>
      <button onClick={handleAdd}>Añadir</button>
    </div>
  );
};

export default AddInstrumentDropdown;

  