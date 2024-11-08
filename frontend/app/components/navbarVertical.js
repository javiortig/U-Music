// NavbarVertical.js
import React from 'react';
import Link from 'next/link';
import styles from '../navbarVertical.module.css';

export default function NavbarVertical (props) {

    const { updatePage, pagina } = props;

    return (
        <nav className={styles.navbar}>
            {pagina === "perfil" ? <div>
                <div className={styles.paginaActual}>
                    <p onClick={() => { updatePage('perfil') }}>Perfil</p>
                </div></div>            
                : <div className={styles.links}>
                    <p onClick={() => { updatePage('perfil') }}>Perfil</p>
                </div>}
            {pagina === "unidas" ? <div>
                <div className={styles.paginaActual}>
                    <p onClick={() => { updatePage('unidas') }}>Actividades Unidas</p>
                </div></div>
                : <div className={styles.links}>
                    <p onClick={() => { updatePage('unidas') }}>Actividades Unidas</p>
                </div>}
            {pagina === "creadas" ? <div>
                <div className={styles.paginaActual}>
                    <p onClick={() => { updatePage('creadas') }}>Actividades Creadas</p>
                </div></div>
                : <div className={styles.links}>
                    <p onClick={() => { updatePage('creadas') }}>Actividades Creadas</p>
                </div>}
            {pagina === "notificaciones" ? <div>
                <div className={styles.paginaActual}>
                    <p onClick={() => { updatePage('notificaciones') }}>Notificaciones</p>
                </div></div>
                : <div className={styles.links}>
                    <p onClick={() => { updatePage('notificaciones') }}>Notificaciones</p>
                </div>}
            {pagina === "reservas" ? <div>
                <div className={styles.paginaActual}>
                    <p onClick={() => { updatePage('reservas') }}>Reservas</p>
                </div></div>
                : <div className={styles.links}>
                    <p onClick={() => { updatePage('reservas') }}>Reservas</p>
                </div>}

            

             {/*<div className={styles.links}>
                <p onClick={() => {updatePage('perfil')}}>Perfil</p>
            </div>
            <div className={styles.links}>
                <p onClick={() => {updatePage('unidas')}}>Actividades Unidas</p>
            </div>
            <div className={styles.links}>
                <p onClick={() => {updatePage('creadas')}}>Actividades Creadas</p>
            </div>
            <div className={styles.links}>
                <p onClick={() => {updatePage('notificaciones')}}>Notificaciones</p>
            </div>
            <div className={styles.links}>
                <p onClick={() => {updatePage('reservas')}}>Reservas</p>
            </div>*/}


        </nav>
    )
}
