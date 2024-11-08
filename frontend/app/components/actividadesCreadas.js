'use client';

import React, { useState, useEffect } from 'react'; 
import Image from "next/image";
import styles from '../perfil.module.css';
import homeStyles from '../home.module.css';
import CartaActividad from './cartaActividad';
import PopupActivity from './popupActivity';
import AddActivity from "../components/addActivity";
import Cargando from './cargando';
import PopupCreateActivity from './popupCreateActivity';


export default function ActividadesCreadas () {

    const [activities, setActivities] = useState(null);	
    const [user, setUser] = useState({}); 
	const [isPopupCreateOpen, setPopupCreateOpen] = useState(false);
	const [token, setToken] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const openCreatePopup = () => {
        setPopupOpen(true);
    };

    const closeCreatePopup = () => {
        setPopupOpen(false);
    };
	
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

				const response = await fetch('http://localhost:3000/api/activity/getCreatedActivitiesProfile', {
					method: 'GET',
					headers: {
						'Authorization': 'Bearer ' +getToken() // Función para obtener el token de las cookies
					}
				});
				//setActivities(response.data);
				if (response.ok) {
					const data = await response.json();
					setActivities(data);
				}
			} catch (error) {
				console.error('Error fetching activities:', error);
			}

			setIsLoading(false);
		};
		fetchActivities();
    } , []);

	//funciones para el popup
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [actividadPopup, setActividadPopup] = useState(null);

    const openPopup = () => {
        setPopupOpen(true);
    };

    const closePopup = () => {
        setPopupOpen(false);
        //fetchFilteredActivities();
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
			{activities.length > 0 ?(
				<div>
					<div className={styles.actividadesContent}>
						{activities.map((actividad, index) => (
							<div className={styles.cartaContainer}>
								{/*<CartaActividad key={actividad.id} actividad={actividad} user={user} />*/}
								<CartaActividad key={actividad.id} actividad={actividad} user={user} 
                                openPopup={openPopup} actividadPopup={setActividadPopup}/>
							</div>
						))}
						{isPopupOpen && <PopupActivity key={actividadPopup.id} actividad={actividadPopup} user={user} onClose={closePopup} />}
					</div>				
					<AddActivity  token ={token}/>
				</div>
			):(
				<div className={styles.messageContainer}>
					<p> Aún no has creado ninguna actividad... ¡Crea actividades para conectar con <br /> otros músicos! </p>
					<button onClick={openCreatePopup}> Crea una actividad </button>
					{isPopupCreateOpen && <PopupCreateActivity onClose={closeCreatePopup} token = {token}/>}
				</div>
			)
			}
		</div>
    )
}