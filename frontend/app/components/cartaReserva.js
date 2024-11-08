// components/CartaActividad.js
'use client';

import React from 'react';
import styles from '../cartaActividad.module.css';
import PopupReserva from './popupReserva';
import { useState } from 'react';
import Image from 'next/image';

const CartaReserva = ({ activity, user, onReload, openPopup }) => {
    const formatDate = (dateString) => {
        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0'); // Ensures the day is two digits
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensures the month is two digits
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    return (
        <div className={styles.cartaActividad}>
            <div className={styles.imagen}>
                <Image
                    src={activity.image}
                    alt={activity.title}
                    width={500}
                    height={500}
                    sizes="100vw"
                    style={{ width: 'auto%', height: 'auto', marginTop: '0%' }} // optional
                />           
            </div>
            <div className={styles.contenidoReserva}>
                <h2>{activity.title}</h2>
                {activity.reservations.length === 0 ? <p>No hay reservas para esta actividad</p> : <h4>Reservas de la actividad:</h4>}
                
                <div className={styles.listaReservas}>
                    {activity.reservations.map((reservas, index) => (
                        <React.Fragment key={reservas.id}>
                            <p><b>Fecha:</b> {formatDate(reservas.date)}</p>
                            <p><b>Aula:</b> {reservas.classroom_id.replace(/\+/g, ' ')}</p>
                            <button onClick={() => {openPopup(activity, reservas)}}> Modificar </button>
                            <br/>
                        </React.Fragment>
                    ))}
                </div>

                <button onClick={() => {openPopup(activity, null)}}> Añadir reserva </button>
            </div>
        </div>
    );
};
  
export default CartaReserva;
  