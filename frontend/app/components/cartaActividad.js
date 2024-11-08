// components/CartaActividad.js
'use client';

import styles from '../cartaActividad.module.css';
import PopupActivity from './popupActivity';
import { useState } from 'react';
import Image from 'next/image';

const CartaActividad = ({ actividad, user, onReload, openPopup, actividadPopup }) => {
    //const [isPopupOpen, setPopupOpen] = useState(false);

    

    return (
        
        <div className={styles.cartaActividad}>
            <div className={styles.imagen}>
                <Image
                    src={actividad.image}
                    alt={actividad.title}
                    width={500}
                    height={500}
                    sizes="100vw"
                    style={{ width: '100%', height: '100%', marginTop: '0%' }} // optional
                />           
            </div>
            <div className={styles.contenido}>
                <h2>{actividad.title}</h2>
                <p>{actividad.description}</p>
                <p>Plazas disponibles en esta actividad: {actividad.available_places}</p>
                <button onClick={() => {  actividadPopup(actividad); openPopup(); }}> Ver más </button>
                
            </div>
        </div>
    );
};
  
export default CartaActividad;
  