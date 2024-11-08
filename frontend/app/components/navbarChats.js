import React, { useEffect, useState } from 'react';
import styles from '../navbarVertical.module.css';
import ActivityCardChat from "../components/activityCardChat";

export default function NavbarChats ({ activities, openChat }) {
    const [busqueda, setBusqueda] = useState('');

    const actividadesFiltradas = activities.filter((actividad) => {
        return (
            actividad.title.toLowerCase().includes(busqueda.toLowerCase())
        );
    });
    
    return (
        <nav className={styles.navbarChats}>
            <div className = {styles.searchBar}>
                <input
                    className={styles.searchInput}
                    placeholder="Buscar chat"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
            {actividadesFiltradas.map((activity) => (
                <ActivityCardChat activity={activity} onClick={openChat} />
            ))}
            
            <div className={styles.linkChat}>
                <a href="/activities"> Unirse a actividades </a>
            </div>
        </nav>
    )
}
