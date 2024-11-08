import React from 'react';
// import Image from "next/image";
import styles from '../popupCreateActivity.module.css';
import imgGenerica from '../../public/images/background-login-image.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { genres, instruments } from '../utils/constants';
import ScrollableList from './scrollableInstrumentList'
import Cargando from './cargando';

import SelectMulti from './selectMulti';

const PopupCreateActivity = ({ onClose, token }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
        try {

            const response = await fetch('http://localhost:3000/api/users/getAllUsers', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' +token // Función para obtener el token de las cookies
                }
            });
            
            //setActivities(response.data);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    fetchUsers();
  }, []);

  if(!users)
  {
    return (
      <Cargando/>
    )
  }

  // State para cada input
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); // previene hacer un submit de default
    
    const activityData = {
      title: title.value,
      description: descripcion,
      total_places: (tipoActividad === 'open') ? numMiembros.value : selectedMembers.length,
      type: tipoActividad,
      genre: selectedGenres,
      instruments: selectedInstruments,
      users: (tipoActividad === 'closed') ? selectedMembers : [],
      sessions: [],
      recurrent: true
    }


    try {
      const response = await fetch('http://localhost:3000/api/activity/createActivity/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' +token // Función para obtener el token de las cookies
          },
          body: JSON.stringify(activityData)
      });
      const responseData = await response.json();
      if (response.ok) {
        // Handle successful submission here, e.g., closing the popup or displaying a success message
        onClose();
      } else {
        // Handle errors or unsuccessful submissions here
        console.error('Failed to submit: ', responseData);
      }
      } catch (error) {
          console.error('Error during activity creation:', error);
      }
  };

  
  const [tipoActividad, setTipoActividad] = useState('open');

  const handleChangeTipoActividad = (e) => {
    setTipoActividad(e.target.value);
  };

  const [selectedInstruments, setSelectedInstruments] = useState([]);

  const handleSelectInstrumentChange = (selectedValue) => {
    setSelectedInstruments(selectedValue.map((item) => item.value));
  };

  const [selectedGenres, setselectedGenres] = useState([]);

  const handleSelectGenreChange = (selectedValue) => {
    setselectedGenres(selectedValue.map((item) => item.value));
  };

  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleSelectMemberChange = (selectedValue) => {
    setSelectedMembers(selectedValue.map((item) => {return {username: item.value}}));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.imageTextSection}>
          <button className={styles.closeButton} onClick={onClose}>
            X
          </button>
          <input type="text" id="title" name="title" placeholder=" Título de la actividad" />
        </div>
        {/*<div className={styles.imagen}>
                <Image
                    src={imgGenerica}
                    alt="Imagen de fondo"
                    width={500}
                    height={500}
                />                
        </div>*/}
        <form className={styles.items} onSubmit={handleSubmit}>
          <div className={styles.tipoActividad}>
            <p>
              Tipo de actividad:
            </p>
          </div>
          {/*selector para elegir entre publica y privada
          hay que alinearlos como en el figma*/}
          <div className={styles.selector}>
            <div>
              <input
                type="radio"
                id="open"
                name="tipo"
                value="open"
                checked={tipoActividad === 'open'}
                onChange={handleChangeTipoActividad}
              />
              <label htmlFor="open">Pública</label>
            </div>
            <div>
              <input
                  type="radio"
                  id="closed"
                  name="tipo"
                  value="closed"
                  checked={tipoActividad === 'closed'}
                  onChange={handleChangeTipoActividad}
                />
                <label htmlFor="closed">Privada</label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <p>
              Descripción:
            </p>
            <textarea
              className={styles.descripcion}
              type="text"
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <p>
              Género musical:
            </p>
            <div className= {styles.selectMulti}>
              <SelectMulti
                options={genres.map((genre) => ({
                  value: genre.toLowerCase(),
                  label: genre
                }))}
                onChange={(selectedOption) => handleSelectGenreChange(selectedOption)}
                placeholder="Select..."
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <p>
              Instrumentos necesarios:
            </p>
            <div className= {styles.selectMulti} >
              <SelectMulti
                options={instruments.map((instrument) => ({
                  value: instrument.toLowerCase(),
                  label: instrument
                }))}
                onChange={(selectedOption) => handleSelectInstrumentChange(selectedOption)}
                placeholder="Select..."
              />
            </div>
          </div>
          {tipoActividad === 'open' ? (
            <div className={styles.formGroup}>
              <p>
                Número de miembros:
              </p>
              <input type="text" id="numMiembros" name="numMiembros" placeholder="0" />
            </div>
          ) : (
            <div>
              <div className={styles.formGroup}>
                <p>
                  Miembros:
                </p>
                <div className={styles.selectMulti}>
                  <SelectMulti
                    options={users.map((user) => ({
                      value: user.nickname,
                      label: user.nickname + ' (' + user.name + ')'
                    }))}
                    onChange={(selectedOption) => handleSelectMemberChange(selectedOption)}
                    placeholder="Select..."
                  />
                </div>
              </div>
            </div>
            
          )}
          <div className={styles.formGroup}>
            <button className={styles.botonCrearActividad} type="submit">Crear Actividad</button>
          </div>
        </form>
          <div>

        </div>
      </div>
    </div>
  );
};

export default PopupCreateActivity;