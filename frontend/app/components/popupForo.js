import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../popupForo.module.css';
import sendImg from '../../public/images/transparent_arrow.png';

const PopupForo = ({ onClose, tag }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    activity: 'general',
    tag: [tag]
  });

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
  }, []);

  if(!token)
  {
      return(
          <p>Cargando...</p>
      );
  }

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
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onClose()
      } else {
        console.error('post failed');
      }
    } catch (error) {
      console.error('Error during post:', error);
    }
  };
      
  return (
    <div className = {styles.popup}>
      <div className = {styles.popupContent}>
        <span className = {styles.close} onClick={onClose}> &times; </span>
        <div className={styles.imageTextContainer}>
          <div className={styles.imageContainer}>
            <Image
              src={user.image}
              alt="icono del perfil"
              width={60}
              height={60}
              sizes="100vw"
              style={{ width: '60px', height: '60px' }} // optional
            /> 
          </div>
          <div className={styles.messageContent}>
            <h4> {user.name} </h4>
          </div>
        </div>
        <input type="text" name="title" className={styles.inputLine} placeholder="Título..." onChange={handleChange} required />
        <input type="text" name="content" className={styles.inputLine} placeholder="Mensage..." onChange={handleChange} required />
        <button className={styles.sendButton} onClick={handleSubmit}>
          <Image
            src={sendImg}
            alt="icono de enviar mensaje"
            width={25}
            height={25}
            sizes="100vw"
            style={{ width: 'auto%', height: 'auto' }} // optional
          />  
      </button>
      </div>
    </div>
  );
};

export default PopupForo;