'use client';

import Navbar from "../components/navbar";

import React, { useEffect, useState } from 'react';

import styles from '../chats.module.css';
import NavbarChats from "../components/navbarChats";
import ChatActivity from "../components/chatActivity";
import Cargando from "../components/cargando";

export default function Chats() {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState({});
    const [activities, setActivities] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activityChat, setActivityChat] = useState({});
    const [chat, setChat] = useState(false);

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

        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/users/getUserProfile', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + getToken()
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUsers();

        const fetchActivities = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/activity/getMyActivitiesProfile', {
					method: 'GET',
					headers: {
						'Authorization': 'Bearer ' + getToken()
					}
				});

                const response2 = await fetch('http://localhost:3000/api/activity/getCreatedActivitiesProfile', {
					method: 'GET',
					headers: {
						'Authorization': 'Bearer ' + getToken()
					}
				});

                if (response.ok && response2.ok) {
                    const data = await response.json();
                    const data2 = await response2.json();
                    setActivities([...data, ...data2]);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };

        fetchActivities();
    }, []);

    if(!token || isLoading)
    {
        return(
            <Cargando />
        );
    }

    const openChat = (activity) => {
        setActivityChat(activity);
        setChat(true);
    }

    return (
        <div className={styles.layout}>
            <Navbar usuario={user} page="chats" />
            <div className={styles.content}>
                <NavbarChats activities={activities} openChat={openChat} />
                <div className={styles.chatContent}>
                    {!chat ? (
                        <div className={styles.messageContainer}>
                            <p> Aun no has abierto ningún chat... ¡Abre alguno para <br/> conectar con otros músicos! </p>
                        </div>
                    ) : (
                        <ChatActivity activity={activityChat} />
                    )}
                </div>
            </div>
        </div>
    );
}