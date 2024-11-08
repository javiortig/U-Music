import React, { useEffect, useState } from 'react';

import styles from '../foroMessage.module.css';
import Image from "next/image";
import Cargando from "./cargando.js";

const ForoMessage = (props) => {
    const [formData, setFormData] = useState({
        content: '',
        postId: props.postId
    });

    const [answers, setAnswers] = useState(null);

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

    const fetchAnswers = async () => {
        try {

            const response = await fetch('http://localhost:3000/api/posts/getPostsAndAnswers/' + props.postId, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getToken() 
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAnswers(data);
            }
            
        } catch (error) {
            console.error('Error fetching answers:', error);
        }
    };

    useEffect(() => {
        fetchAnswers();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {    
            const response = await fetch('http://localhost:3000/api/answers/createAnswer', {
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

                fetchAnswers();
            } else {
                console.error('answer failed');
            }
        } catch (error) {
            console.error('Error during answer:', error);
        }
    };

    if (answers === null)
    {
        return <Cargando />;
    }
    
    return (
        <div className={styles.messageContainer}>
            <div className={styles.imageTextSection}>
                <div className={styles.imageTextContainer}>
                    <div className={styles.imageContainer}>
                        <Image
                            src={answers.post.userImage}
                            alt="Img User"
                            width={100}
                            height={100}
                            sizes="100vw"
                            style={{ width: '100px', height: '100px', marginRight: '2%'}}
                        />
                    </div>
                    <div className={styles.messageContent}>
                        <h3> {answers.post.title} </h3>
                        <p className={styles.username}> {answers.post.nickname} </p>
                        <p> {answers.post.content} </p>
                    </div>
                </div>
            </div>
            <div className={styles.answerContainer}>
                <input type="text" name="content" value={formData.content} placeholder="Responder..." onChange={handleChange} />
                <button onClick={handleSubmit}> enviar </button>
            </div>
            {answers.answers.map((answer, index) => (
                <div key={index} className={styles.answer}>
                    <div className={styles.username}> {answer.nickname} </div>
                    <div> {answer.content} </div>
                </div>
            ))}
        </div>
    );
};

export default ForoMessage;