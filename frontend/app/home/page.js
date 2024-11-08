'use client';

import Navbar from "../components/navbar";
import Carousel from "../components/carousel";
import AddActivity from "../components/addActivity";
import CartaActividad from "../components/cartaActividad";
import PopupActivity from '../components/popupActivity';
import React, { useEffect, useState } from 'react';

import Cargando from "../components/cargando";

import styles from '../home.module.css';

export default function Home() {
    const [token, setToken] = useState(null);
    const [activities, setActivities] = useState([]);
    const [user, setUser] = useState({}); 
    const [isLoading, setIsLoading] = useState(false);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [actividadPopup, setActividadPopup] = useState(null);

    const openPopup = () => {
        setPopupOpen(true);
    };

    const closePopup = () => {
        setPopupOpen(false);
        fetchActivities();
    };
    
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

    const fetchActivities = async () => {
        setIsLoading(true);

        try {
            const userCall = await fetch('http://localhost:3000/api/users/getUserProfile', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' +getToken() 
                }
            });


            if (userCall.ok) {
                const data = await userCall.json();
                setUser(data.user);
            }

            const response = await fetch('http://localhost:3000/api/activity/getActivities', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' +getToken() // Función para obtener el token de las cookies
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    };

    const [isCarouselPopupOpen, setIsCarouselPopupOpen] = useState(false);
    const [carouselActivity, setCarouselActivity] = useState({});

    const openCarouselPopup = (activity) => {
        setCarouselActivity(activity);
        setIsCarouselPopupOpen(true);
    }

    const closeCarouselPopup = () => {
        setIsCarouselPopupOpen(false);
        setCarouselActivity(null);
        fetchActivities();
    }

    useEffect(() => {
        setToken(getToken());

        fetchActivities();
    }, []);
    
    if(!token)
    {
        return(
            <Cargando />
        );
    }

    return (
        <div className={styles.layout}>
            <Navbar usuario={user} page="home" />
            <div className={styles.home}>
                <div className={styles.carousel}>
                    <Carousel openPopup={openCarouselPopup} token={token} />

                    {isCarouselPopupOpen &&
                        <div className={styles.contenidoPopupCarousel}>
                            <PopupActivity key={carouselActivity.id} actividad={carouselActivity} user={user} onClose={closeCarouselPopup} />
                        </div>
                    }
                </div>
                <div className={styles.homeContent}>
                    <div className={styles.divisoria}></div>
                    <h1>Actividades</h1>

                    <div className={styles.formGroup}>
                        {isLoading ? (
                            <Cargando />
                        ) : (
                            activities.map((actividad, index) => (
                                <div className={styles.cartaContainer}>
                                    <CartaActividad key={actividad.id} actividad={actividad} user={user}
                                        onReload={fetchActivities} openPopup={openPopup} actividadPopup={setActividadPopup} />
                                </div>
                            ))
                        )}
                        {isPopupOpen && <PopupActivity key={actividadPopup.id} actividad={actividadPopup} user={user} onClose={closePopup} />}

                    </div>
                    <AddActivity token={token} />
                </div>
            </div>
        </div>
    );
}