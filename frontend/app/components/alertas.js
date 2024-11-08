import React from "react";
import { useState } from "react";
import styles from "../alertas.module.css";


const Alertas = ({tipoAlerta, mostrar, onClose }) => {

    

    let mensaje;
    switch (tipoAlerta) {
        case 'unido':
          mensaje = 'Te has unido a la actividad correctamente.';
          break;
        case 'salir':
          mensaje = 'Has salido de la actividad correctamente.';
          break;
        case 'creada':
            mensaje = 'La actividad ha sido creada correctamente.';
            break;
        case 'eliminar':
          mensaje = 'La actividad ha sido eliminada.';
          break;
        case 'añadido':
          mensaje = 'Usuario añadido a la actividad correctamente.';
          break;
        default:
          mensaje = '';
      }
    

    return mostrar ? (
        <div className={styles.overlay}>
          <div className={styles.alerta}>
            <p>{mensaje}</p>
            <button onClick={onClose}>Aceptar</button>
          </div>
        </div>
      ) : null;
};

export default Alertas;