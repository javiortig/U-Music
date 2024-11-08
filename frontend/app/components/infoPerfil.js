'use client';

import React, { useState, useEffect, use } from 'react'; 
import Image from "next/image";
import styles from '../perfil.module.css';
import SelectMulti from './selectMulti';
import { instruments as allInstruments } from '../utils/constants';


import AddInstrumentDropdown from './addInstrumentDropdown';
import InstrumentList from './instrumentList';


export default function infoPerfil ({ usuario, updateUser }) {
    const [token, setToken] = useState(null);

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

    }, []);
    
    const [userData, setUserData] = useState(usuario); // Estado para almacenar los datos del usuario
    const [file, setFile] = useState(null);
    const [updated, setUpdated] = useState(true);
    const instrumentosIniciales = userData.instruments || [];
    const [instrumentos, setInstrumentos] = useState(instrumentosIniciales); // Estado para almacenar los instrumentos del usuario
    const email = userData.email;
    const [nickname, setNickname] = useState(userData.nickname);
    const [bio, setBio] = useState(userData.bio);

    const [messageActualizado, setMessageActualizado] = useState(
        <p> </p>
    );

    /*const [formData, setFormData] = useState({
        nickname: '',
        password: '',
        bio: '',
        instruments: ['',''],
        //receiveNotifications: false
      });*/

    /**Información sobre el horario de disponibilidad */
    const hours = [
        { value: '9-11', label: '9:00-11:00' },
        { value: '11-13', label: '11:00-13:00' },
        { value: '13-15', label: '13:00-15:00' },
        { value: '15-17', label: '15:00-17:00' },
        { value: '17-19', label: '17:00-19:00' },
        { value: '19-21', label: '19:00-21:00' },
    ];
    const hoursObject = {
        "9-11": "9:00-11:00",
        "11-13": "11:00-13:00",
        "13-15": "13:00-15:00",
        "15-17": "15:00-17:00",
        "17-19": "17:00-19:00",
        "19-21": "19:00-21:00",
    }

    const [availabilitySchedule, setAvailabilitySchedule] = useState(usuario.availabilitySchedule || {});
    const [newAvailabilitySchedule, setNewAvailabilitySchedule] = useState({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
    })
    ;
    //ordeno segun los dias de la semana el horario de disponibilidad
    const weekDays = {
        "Lunes": "monday",
        "Martes": "tuesday",
        "Miércoles": "wednesday",
        "Jueves": "thursday",
        "Viernes": "friday",
        "Sábado": "saturday",
        "Domingo": "sunday",
    }
    
    // Ordenar el array de días según el orden de la semana
    const sortedAvailabilitySchedule = Object.keys(weekDays).reduce((acc, day) => {
        acc[day] = availabilitySchedule[weekDays[day]] || null;
        return acc;
    }, {});

    const horasUsuario = Object.keys(availabilitySchedule).map(day => availabilitySchedule[day]).flat();

    const handleSelectChange = (selectedOption, day) => {

        /*setFormData((formData) => {
            return({
              ...formData,
              availabilitySchedule: {
                ...formData.availabilitySchedule,
                [weekDays[day]]: selectedOption.value,
              }
            });
          });*/
        setNewAvailabilitySchedule({ ...newAvailabilitySchedule,
            [weekDays[day]]: selectedOption.map(option => option.value)
        });

        setAvailabilitySchedule({ ...availabilitySchedule, 
            [weekDays[day]]: selectedOption.map(option => option.value) 
        });
        setUpdated(false);
    };


    /** Funciones para las CONTRASEÑA */

    const [password, setPassword] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [messagePassword, setMessagePassword] = useState(
        <p> </p>
    );
    const [messagePassword2, setMessagePassword2] = useState(
        <p> </p>
    );
    const [passwordModified, setPasswordModified] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [passwordUpdate, setPasswordUpdate] = useState({
        password: ''
    });

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    const handleChangePassword = (e) => {
        setPassword(e.target.value);
        if (e.target.value === '') {
            setPasswordModified(false);
        } else {
            setPasswordModified(true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
        /*setFormData({
            ...formData,
            [e.target.name]: e.target.value
          });*/
        if(name === 'nickname'){
            setNickname(value);
        } else if(name === 'bio'){
            setBio(value);
        }

        setUpdated(false);
    };

    const handlePasswordConfirmationChange = (e) => {
        const value = e.target.value;
        setPasswordConfirmation(value);
    };

    const handlePasswordValidation = () => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,17}$/;
        if (password === '') {
            setMessagePassword(<p> </p>);
            setPasswordModified(false);
        }
        if (!password.match(passwordRegex) && password !== '') {
            setMessagePassword(<p>La contraseña debe tener entre 8 y 16 caracteres, una mayúscula y un número</p>);
            
            return;
        } else {
            setMessagePassword(<p> </p>);
            setPasswordModified(true);
        }
        setPasswordModified(true);
    };

    const handleSubmitPassword = async () => {
        try {
            if (passwordModified && password !== passwordConfirmation) {
                setMessagePassword2(
                    <div className={styles.redText}>
                        <p>Las contraseñas no coinciden</p>
                    </div>
                );
                return;
            } else {
                
                setPasswordUpdate( {password: password} );

                // Realizar la petición al backend para actualizar la contraseña del usuario

                const response = await fetch('http://localhost:3000/api/users/updateUserPassword', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify( passwordUpdate ),
                });
                if(response.ok){
                setMessagePassword2(
                    <div >
                        <p>Contraseña modificada correctamente</p>
                    </div>);
                } else {
                    return;
                }

            }
        } catch (error) {
            console.error('Error al actualizar contrseña:', error);
        }
    };





    /** Gestion de la lista de INSTRUMENTOS */

    //const instrumentosIniciales = userData.instruments || [];
    
    const eliminarInstrumento = (instrumento) => {
        const newInstrumentos = instrumentos.filter((inst) => inst !== instrumento);
        setInstrumentos(newInstrumentos);
        setUpdated(false);
    };

    const agregarInstrumento = (instrumento) => {
        setInstrumentos([...instrumentos, instrumento]);
        setUpdated(false);
    };

    const handleSubmit = async () => {
        
        try {

        //setUserData({ ...userData, ["instruments"]: instrumentos, ["availabilitySchedule"]: availabilitySchedule});

            
            const userDataToUpdate = {
                nickname: userData.nickname,
                bio: userData.bio,
                instruments: instrumentos,
                availabilitySchedule: newAvailabilitySchedule
                //availabilitySchedule: JSON.stringify(availabilitySchedule)
            }

            // Realizar la petición al backend para actualizar los datos del usuario
            const response = await fetch('http://localhost:3000/api/users/updateUserProfile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(userDataToUpdate),
            });
            if (!response.ok) {
                console.error('Error al actualizar usuario:', error);
                return;
            } else {
                
                setMessageActualizado(
                    <div >
                        <p>Usuario actualizado correctamente</p>
                    </div>);
            }
            setUpdated(true);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
        }
    };



    /* Funciones para actualizar la IMAGEN DE PERFIL */
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png')) {
            setFile(selectedFile);
        } else {
            // Mostrar mensaje de error al usuario o manejarlo según tu necesidad
            console.error('Formato de archivo no válido. Selecciona un archivo .jpg o .png.');
        }
    };
    /*const [formImage, setFormImage] = useState({
        image: {}
    });*/
    /* Modificar la imagen */
    const handleImageUpload = async () => {
        try {

            const formData = new FormData();
            formData.append('image', file); // 'image' debe coincidir con el nombre del campo en el backend

            // Realizar la petición al backend para actualizar la imagen del usuario
            const response = await fetch('http://localhost:3000/api/users/updateUserImage', {
                method: 'PUT',
                headers: {
                    //'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });

            if (!response.ok) {
                console.log('Error al subir la imagen');
                return;
            } else {
                console.log('Imagen subida correctamente');
            }

            // Actualizar la imagen de perfil en el estado del usuario
            setUserData({ ...userData, image: URL.createObjectURL(file) });

            const newUserData = { ...userData, image: URL.createObjectURL(file) };
            updateUser(newUserData);

            // Limpiar el campo de selección de archivo
            setFile(null);
        } catch (error) {
            console.error('Error al actualizar la imagen de perfil:', error);
        }
    };


    return (
        <div className={styles.perfilContent}>
            <div className={styles.tituloPerfil}>
                <div className={styles.cambioImagenBox}>
                <div className={styles.contenedorImagen}>
                    <div className={styles.imgPerfil}>

                        <Image
                            src={userData.image}
                            alt="imgPerfil"
                            layout="fill"
                            objectFit="contain"
                        />
                        
                    </div>
                    
                </div>
                <div className={styles.cambioImagen}>
                            <input type="file" accept=".jpg, .jpeg, .png" onChange={handleFileChange} />
                            <button onClick={handleImageUpload}>Cambiar Imagen</button>
                </div>
                </div>
                <h1>{usuario.name}</h1>
            </div>
            <div className={styles.infoPerfil}>
                <div>
                    <h3>Correo electrónico</h3>
                    <p>{email}</p>
                </div>
                <div>
                    <h3>Nickname</h3>
                    <input type="text" name="nickname" value={nickname} onChange={handleChange} />
                </div>
                <div>
                    <h3>Biografía</h3>
                    <input type="text" name="bio" value={bio} onChange={handleChange} />
                </div>

                <div>
                    <h3>Mis Instrumentos</h3>
                    <InstrumentList instruments={instrumentos} onDelete={eliminarInstrumento} />
                    <h3>Añadir Instrumento</h3>
                    <AddInstrumentDropdown userInstruments={instrumentos} allInstruments={allInstruments} onAdd={agregarInstrumento} />

                </div>

                <div className={styles.availabilitySchedule}>
                    <label htmlFor="availabilitySchedule">Horario de disponibilidad:</label>
                    <table>
                        <tr>
                            <th>Día</th>
                            <th>Hora</th>
                        </tr>
                        {Object.keys(sortedAvailabilitySchedule).map(day => (
                            <tr key={day}>                                
                                <td><b>{day.charAt(0).toUpperCase() + day.slice(1)}:</b></td>
                                <td>                                    
                                    <SelectMulti
                                        options={hours}
                                        value={sortedAvailabilitySchedule[day].map(time => ({ value: time, label: hoursObject[time]})) || null}
                                        onChange={(selectedOption) => handleSelectChange(selectedOption, day)}
                                        placeholder="HH:MM"
                                    />
                                </td>
                            </tr>
                        ))}
                    </table>
                </div>


                <div>
                    <button type="button" onClick={handleSubmit} disabled={updated}>
                        {updated ? 'Actualizado' : 'Actualizar'}
                    </button>
                    <div>
                        {messageActualizado}
                        </div>
                </div>
            </div>
        
            
            
            <div className={styles.passwordContainer}>
                <h3>Modificar contraseña </h3>
                <p>Nueva contraseña:</p>

                <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handleChangePassword}
                    onBlur={handlePasswordValidation}
                />
                <div>
                    {messagePassword}
                </div>
                <button type="button" onClick={toggleShowPassword}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
            
            
            
                {passwordModified ? (
                    <div className={styles.newPassword}>
                        <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={passwordConfirmation}
                            onChange={handlePasswordConfirmationChange}
                        />
                        <button type="button" onClick={toggleShowConfirmPassword}>
                            {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <div>
                            {messagePassword2}
                        </div>


                        <button type="button" onClick={handleSubmitPassword} disabled={!passwordModified}>
                            Modificar Contraseña
                        </button>
                    </div>
                ) : null}
            
            </div>

        </div>

    )
}