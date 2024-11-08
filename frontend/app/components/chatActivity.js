import styles from '../chatActivity.module.css';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ChatActivity({ activity }) {
    const [user, setUser] = useState({});
    const [postsActivity, setPostsActivity] = useState([]); 
    const [messages, setMessages] = useState([]);

    const [formData, setFormData] = useState({
        title: 'hola',
        content: '',
        activity: activity._id
    });

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

    const fetchPosts = async () => {
        try {

            const response = await fetch('http://localhost:3000/api/posts/getPostsByActivity/' + activity._id, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getToken() 
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPostsActivity(data);
            }
            
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const getMessages = () => {
        const newMessages = postsActivity.map(post => ({
            id: post._id,
            text: post.content,
            sender: post.nickname === user.nickname ? 'sent' : 'received',
            user: post.nickname
        }));
    
        setMessages([...newMessages]);
    }

    useEffect(() => {
        fetchUsers();

        fetchPosts();
    }, [activity]);

    useEffect(() => {
        getMessages();
    }, [postsActivity, user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {    
            const response = await fetch('http://localhost:3000/api/posts/createPost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify(formData)
            });
            

            if (response.ok) {
                setFormData({
                    ...formData,
                    content: ''
                });

                fetchPosts();
                getMessages();
            } else {
                console.error('post failed');
            }
        } catch (error) {
            console.error('Error during post:', error);
        }
    };
    
    return (
        <div>
            <div className={styles.chatBar}>
                <div className={styles.imageContainer}>
                    <Image
                        src={activity.image}
                        alt="Imagen de la actividad"
                        width={25}
                        height={25}
                        sizes="100vw"
                        style={{ width: '40px', height: '40px', marginRight: '2%', borderRadius: '50%'}}
                    />
                </div>
                <p> {activity.title} </p>
            </div>
            <div className={styles.container}>
                <div className={styles.messagesContainer}>
                    {messages.map(message => (
                        <div key={message.id} className={message.sender === 'sent' ? styles.messageSent : styles.messageReceived}>
                            <h5> {message.user} </h5>
                            <p> {message.text} </p>
                        </div>
                    ))}
                </div>
                <div className={styles.inputContainer}>
                    <input type="text" name="content" value={formData.content} placeholder="Escribe un mensaje..." onChange={handleChange} />
                    <button onClick={handleSubmit}> Enviar </button>
                </div>
            </div>
        </div>
    );
};