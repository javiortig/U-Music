'use client';

import React, { useState, useEffect } from 'react';
import styles from '../perfil.module.css';

function formatDate(dateTimeString) {
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${day} de ${month} de ${year}`;
}

function formatTime(dateTimeString) {
	const date = new Date(dateTimeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

export default function Notificaciones () {
    const [notifications, setNotifications] = useState([]);
	
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

		const fetchNotifications = async () => {
			try {
				

				const response = await fetch('http://localhost:3000/api/notifications/getNotifications', {
					method: 'GET',
					headers: {
						'Authorization': 'Bearer ' +getToken() // Función para obtener el token de las cookies
					}
				});
				
				//setActivities(response.data);
				if (response.ok) {
					const data = await response.json();
					
					setNotifications(data);
				}
			} catch (error) {
				console.error('Error fetching notifications:', error);
			}
		};
		fetchNotifications();
    } , []);

	if(!notifications)
	{
		return (
			<Cargando/>
		);
	}

    return (
		<div className={styles.actividadesContent}>
			{notifications.map((notification, index) => (
				<div className={styles.notificationContainer} key={notification._id}>
					<div className={styles.notificationContent}>
						<h3>{notification.subject}</h3>
						{
							notification.message.split('\n').map((item, idx) => (
								<React.Fragment key={idx}>
									<p>{item}</p>
								</React.Fragment>
							))
						}
					</div>
					<div className={styles.notificationTime}>
						{formatDate(notification.createdAt)}
						<br />
						{'a las ' + formatTime(notification.createdAt)}
					</div>
				</div>
			))}
        </div>
    )
}