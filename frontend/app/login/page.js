'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import styles from "../login.module.css";

import utadLogo from '../../public/images/logo1.png'

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [mensajeUsuario, setMensajeUsuario] = useState(
    <p> </p>
  );
  const [mensajeContraseña, setMensajeContraseña] = useState(
    <p> </p>
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        // Save token as cookie
        document.cookie = `token=${data.token}; path=/`;
        const responseUser = await fetch('http://localhost:3000/api/users/getUserProfile', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + data.token
          }
        });

        if (responseUser.ok) {
          const dataUser = await responseUser.json();
          document.cookie = `user=${dataUser.user}; path=/`;
        } else {
          console.error('Error fetching user');
        }
        // Redirect user
        router.push('/home');
      } else {
        if(response.status === 401){
          setMensajeContraseña(<p className={styles.redText}>Contraseña incorrecta</p>)
          setMensajeUsuario(<p> </p>)
        } else if(response.status === 404){
          setMensajeUsuario(<p className={styles.redText}>Usuario no registrado</p>)
          setMensajeContraseña(<p> </p>)
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };


  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.center}>
          <Image
            src={utadLogo}
            alt="Logo de U-Tad"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: '80%', height: 'auto', marginTop: '10%' }} // optional
          />
        </div>
         
         {/*<h1>Grupos Musicales</h1>*/}


        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email o Usuario:</label>
            <input type="text" className={styles.inputLine} id="email" name="email" placeholder="x x x x x x x x x" onChange={handleChange} required />
            <div>
              {mensajeUsuario}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña:</label>
            <input type="password" className={styles.inputLine} id="password" name="password" placeholder="• • • • • • • •" onChange={handleChange} required />
            <div>
              {mensajeContraseña}
            </div>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.checkboxContainer}>
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember"></label>
              <span>Recuérdame</span>
            </div>
          </div>
          <div className={styles.formGroup}>
            <button type="submit">Iniciar sesión</button>
          </div>
          <div className={styles.linkGroup}>
            <div>
              <Link href="/forgot-password">
                <p className = {styles.link}>¿Has olvidado tu contraseña?</p>
              </Link>
            </div>
            <div>
              <Link href="/register"> 
                <p className = {styles.link}>¿Aún no tienes cuenta?</p>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

