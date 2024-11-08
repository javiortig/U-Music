'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import styles from "../login.module.css";


import utadLogo from '../../public/images/logo1.png'

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: ''
    });

    const [buttonText, setButtonText] = useState('Registrar correo');
    const [comentText, setComentText] = useState(
            <p>Registra un correo @live.u-tad o @u-tad</p>
        );
    
    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };

    const [formContent, setFormContent] = useState(true);

    const handleBackClick = () => {
        setFormContent(true);
        setButtonText('Registrar correo');
        setComentText(
            <p>Registra un correo @live.u-tad o @u-tad</p>
        );
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await fetch('http://localhost:3000/api/auth/verification-email/' + formData.email, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            
            setFormContent(false);
            setButtonText('Enviar de nuevo');
                
        } else {
            setFormContent(true);
            setComentText(
                <p className={styles.redText}>Correo ya registrado</p>
            );
            
        }
        } catch (error) {
            setFormContent(true);
            setComentText(
                <p className={styles.redText}>Correo ya registrado</p>
            );
            console.error('Error during register:', error);
        }
    };

  return (
    <div className={styles.loginContainer}>
        <div className={styles.registerBox}>
            <div className={styles.center}>
            <Image
                src={utadLogo}
                alt="Logo de U-Tad"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: '80%', height: 'auto', marginTop: '5%' }} // optional
            />
            </div>
            
            {/*<h1>Grupos Musicales</h1>*/}



            
            <div>
                {formContent? (
                    
                    <div className={styles.formGroup}>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="email">Email:</label>
                            <input type="text"
                                className={styles.inputLine}
                                id="email" name="email"
                                placeholder="x x x x x x x x x"
                                onChange={handleChange}
                                required
                            />

                            <div>
                                {comentText}
                            </div>
                            <div className={styles.formGroup}>
                                <button type="submit">{buttonText}</button>
                            </div>
                        </form>

                        <Link href="/login">
                            <p className={styles.link}>Ya estoy registrado</p>
                        </Link>
                    </div> 
                ) : (
                    <div className={styles.formGroup}>
                        <p>Se ha enviado un correo de verificación a</p>
                        <p className={styles.chosenEmail}>{formData.email}</p>
                        <div className={styles.formGroup}>
                            <button type="submit">{buttonText}</button>
                        </div>
                        <a className = {styles.link} onClick={handleBackClick}>Atrás</a>
                    </div>
                    
                )}
            </div>
            
        </div>
    </div>
  );
}