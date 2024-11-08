'use client';

import Navbar from "../components/navbar";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import backImg from '../../public/images/flecha.png';

import styles from '../foro.module.css';
import Cargando from "../components/cargando";
import ForoMessage from "../components/foroMessage";
import AddForo from "../components/addForo";
import { genres } from '../utils/constants';

export default function Foro() {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState({});
    const [messages, setMessages] = useState([]); 
    const [forum, setForum] = useState(false);
    const [genre, setGenre] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [reload, setReload] = useState(false);

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

    const fetchMessages = async (genre) => {
        try {
            
            setMessages([]);

            const response = await fetch('http://localhost:3000/api/posts/getPostsByTag?tag=' + genre, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getToken() 
                }
            });


            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
            
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        setToken(getToken());

        fetchUsers();
    }, []);

    useEffect(() => {
        fetchMessages(genre);

        setReload(false);
    }, [reload]);

    if(!token)
    {
        return(
            <Cargando />
        );
    }

    const handleContent = (genre) => {
        setForum(!forum);
        
        setGenre(genre);
        fetchMessages(genre);
    };

    const filterGenre = genres.filter((genre) => {
        return (
            genre.toLowerCase().includes(busqueda.toLowerCase())
        );
    });

    // const filterMessage = messages.filter((message) => {
    //     return (
    //         message.toLowerCase().includes(busqueda.toLowerCase())
    //     );
    // });

    return (
        <div className={styles.layout}>
            <Navbar usuario={user} page="foro" />

            <div>
                {!forum ? (
                    <div className={styles.content}>
                        <div className = {styles.searchBar}>
                            <input
                                className={styles.searchInput}
                                placeholder="Buscar género"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <div className={styles.foroContent}>
                            {filterGenre.map((genre) => (
                                <div className={styles.subforoCard} onClick={() => handleContent(genre.toLowerCase())}> {genre.toUpperCase()} </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className={styles.content}>
                            <div className={styles.container}>
                                <button onClick={handleContent}>
                                    <Image
                                        src={backImg}
                                        alt="icono para retroceder"
                                        width={50}
                                        height={50}
                                        sizes="100vw"
                                        style={{ width: 'auto%', height: 'auto', }}
                                    />  
                                </button> 
                                <div className = {styles.searchBar}>
                                    <input
                                        className={styles.searchInput}
                                        placeholder="Buscar mensaje"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                </div>
                                <p> {genre.toUpperCase()} </p>
                            </div>
                            {messages.map((message) => (
                                <ForoMessage postId={message._id} />
                            ))}
                        </div>
                        <AddForo onReload={setReload} tag={genre} />
                    </div>
                )}
            </div>
        </div>
    );
}
