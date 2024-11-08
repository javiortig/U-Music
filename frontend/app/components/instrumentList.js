'use client';



// Componente para la lista de instrumentos
import React, { useState } from 'react';
import ConfirmationPopup from './confirmationPopup';
import styles from '../perfil.module.css';

const InstrumentList = ({ instruments, onDelete }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [instrumentToDelete, setInstrumentToDelete] = useState('');

  const handleDelete = (instrument) => {
    setInstrumentToDelete(instrument);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    onDelete(instrumentToDelete);
    setShowConfirmation(false);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <div className={styles.listaInstrumentos}>
      <ul>
        {instruments.map((instrument) => (
          <li key={instrument}>
            {instrument + " "}
            <button onClick={() => handleDelete(instrument)}>X</button>
          </li>
        ))}
      </ul>
      {showConfirmation && (
        <ConfirmationPopup
          message={`¿Estás seguro de que quieres eliminar ${instrumentToDelete}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default InstrumentList;

