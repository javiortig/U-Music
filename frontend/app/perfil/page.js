'use client';

import Navbar from "../components/navbar";
import NavbarVertical from "../components/navbarVertical";
import InfoPerfil from "../components/infoPerfil";
import ActividadesUnidas from "../components/actividadesUnidas";
import ActividadesCreadas from "../components/actividadesCreadas";
import Notificaciones from "../components/notificaciones";
import Cargando from "../components/cargando";
import ReservaAulas from "../components/reservasAulas"

import React, { useEffect, useState } from 'react';

import styles from '../perfil.module.css';

export default function Perfil() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState(null);
    const [pageName, setPageName] = useState(null); // ['perfil', 'unidas', 'creadas', 'notificaciones', 'reservas'
    const [isLoading, setIsLoading] = useState(true);

    const getToken = () => {
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name.trim() === 'token') {
                return value;
            }
        }
        return null;
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
      };

    const updatePage = (pageName) => {
        setPageName(pageName);
        switch(pageName)
        {
            case 'perfil':
                setPage(<InfoPerfil usuario={user} updateUser={updateUser}/>);
                break;
            case 'unidas':
                setPage(<ActividadesUnidas/>);
                break;
            case 'creadas':
                setPage(<ActividadesCreadas/>);
                break;
            case 'notificaciones':
                setPage(<Notificaciones/>);
                break;
            case 'reservas':
                setPage(<ReservaAulas/>);
                break;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = getToken();

                const userCall = await fetch('http://localhost:3000/api/users/getUserProfile', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (userCall.ok) {
                    const data = await userCall.json();
                    setUser(data.user);                    
                }

            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            // Only update the page when the user is available
            updatePage('perfil');
        }
    }, [user]);
    


    if(isLoading || !page || !user)
    {
        return (
            <Cargando/>
        )
    }

    

    return(
        
        <div className={styles.layout}>
            <div className={styles.content}>
                <Navbar usuario={user}/>
                <NavbarVertical updatePage = {updatePage} pagina = {pageName}/>                
                {page}
            </div>
        </div>
    );

}