'use client';

import React, { useState, useEffect } from 'react'; 
import Image from "next/image";
import styles from '../perfil.module.css';
import PopupActivity from './popupActivity';
import homeStyles from '../home.module.css';
import CartaActividad from './cartaActividad';

import Cargando from "./cargando";

export default function ActividadesUnidas () {

    const [activities, setActivities] = useState(null);	
    const [user, setUser] = useState({}); 
	const [token, setToken] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	
    useEffect(() => {
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

		setToken(getToken());

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
					const dataUser = await userCall.json();
					setUser(dataUser.user);
				}

				const response = await fetch('http://localhost:3000/api/activity/getMyActivitiesProfile', {
					method: 'GET',
					headers: {
						'Authorization': 'Bearer ' +getToken() // Función para obtener el token de las cookies
					}
				});
				
				//setActivities(response.data);
				if (response.ok) {
					const data = await response.json();
					setActivities(data);
					if(data.length === 0){
						setNoActividades(true);
					}
				}

			} catch (error) {
				console.error('Error fetching activities:', error);
			}

			setIsLoading(false);
		};
		fetchActivities();
    } , []);

	const fetchAtivitiesClose = async () => {
		try {
			const response = await fetch('http://localhost:3000/api/activity/getMyActivitiesProfile', {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + token 
				}
			});

			if (response.ok) {
				const data = await response.json();
				setActivities(data);
			}
		}
		catch (error) {
			console.error('Error fetching activities:', error);
		}
	}

	//funciones para el popup
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [actividadPopup, setActividadPopup] = useState(null);

    const openPopup = () => {
        setPopupOpen(true);
    };

    const closePopup = () => {
        setPopupOpen(false);
        fetchAtivitiesClose();
    };

	if(!activities)
	{
		return (
			<div className={styles.actividadesContent}>
				<Cargando />
			</div>
		);
	}

    return (
		<div>
			{activities.length > 0 ? (
				<div className={styles.actividadesContent}>
					{activities.map((actividad, index) => (
						<div className={styles.cartaContainer}>
							{/*<CartaActividad key={actividad.id} actividad={actividad} user={user} onReload={fetchAtivitiesClose} />*/}
							<CartaActividad key={actividad.id} actividad={actividad} user={user} 
                                onReload={fetchAtivitiesClose} openPopup={openPopup} actividadPopup={setActividadPopup}/>
						</div>
					))}
					{isPopupOpen && <PopupActivity key={actividadPopup.id} actividad={actividadPopup} user={user} onClose={closePopup} />}

				</div>
			) : (
				<div className={styles.messageContainer}>
					<p> Aún no te has unido a ninguna actividad... ¡Únete a actividades para conectar con <br /> otros músicos! </p>
					<a href="/activities"> Unirse a actividades </a>
				</div>
			)}
		</div>
    )
}