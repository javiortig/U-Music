'use client';

import Navbar from "../components/navbar";
import SearchBar from "../components/searchBar";
import AddActivity from "../components/addActivity";
import CartaActividad from "../components/cartaActividad";
import PopupActivity from '../components/popupActivity';
import {genres, instruments} from '../utils/constants';
import SelectMulti from "../components/selectMulti";
import Cargando from "../components/cargando";


import React, { use, useEffect, useState } from 'react';

import styles from '../activitiesPage.module.css';

//import { genres } from '../utils/constants';

export default function Activities() {
    const [token, setToken] = useState(null);
        /* Función para obtener el token de las cookies */
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

    
    const [isLoading, setIsLoading] = useState(false);
    

    // Función para alternar la visibilidad de los filtros
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [mostrarOrden, setMostrarOrden] = useState(false);

    const toggleFiltros = () => {
        setMostrarFiltros(!mostrarFiltros);
        setMostrarOrden(false);
    };

    const toggleOrden = () => {
        setMostrarOrden(!mostrarOrden);
        setMostrarFiltros(false);
    };

    const [selectedOrder, setSelectedOrder] = useState("recent"); // Estado para el tipo de orden seleccionado

    const [selectedState , setSelectedState] = useState("plazas disponibles"); //Estado para el tipo de estado seleccionado [completed, pending, all


    /* Función para setear las actividades */
    const [activities, setActivities] = useState([]);
    const [usuario, setUsuario] = useState({});
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {

        const token = getToken();
        setToken(token);

        const fetchUsers = async () => {

            /**conseguimos el usuario de la sesion
             * Creo que idealemnte esto se debería pasar desde el home
             */
            try {
                const response = await fetch('http://localhost:3000/api/users/getUserProfile', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' +token
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsuario(data.user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }

            /**conseguimos todos los usuarios, para poder hacer los filtros */

            try {
                const response = await fetch('http://localhost:3000/api/users/getAllUsers', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' +token 
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAllUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }

        };

        fetchUsers();

        /** Obtenemos todas las actividades */
        const fetchActivities = async () => {
            setIsLoading(true);
            
            try {
                const response = await fetch('http://localhost:3000/api/activity/getActivities', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token // Función para obtener el token de las cookies
                    }
                });
                //setActivities(response.data);
                if (response.ok) {
                    const data = await response.json();
                    setActivities(data);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };

        fetchActivities();

        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Llamar a fetchFilteredActivities cuando selectedOrder cambie
        fetchFilteredActivities();
    }, [selectedOrder, selectedState]);

    
    const handleOrderChange = (e) => {
        setSelectedOrder(e.target.value);
    };    

    const handleStateChange = (e) => {
        if(e.target.checked){
            setSelectedState(e.target.value);
        }else{
            setSelectedState("plazas disponibles");
        }
    };

    const fetchFilteredActivities = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('sortedby', selectedOrder);
            params.append('state' , selectedState);
    
            const response = await fetch('http://localhost:3000/api/activity/getFilteredActivities?' + params.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getToken() // Función para obtener el token de las cookies
                }
            });
    
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching filtered activities:', error);
        }
        setIsLoading(false);
    };

    /* Funciones para filtrado */
    const [filtroInstrumento, setFiltroInstrumento] = useState([]);
    const [filtroGenero, setFiltroGenero] = useState([]);
    const [filtroAutor, setFiltroAutor] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    

    const actividadesFiltradas = activities.filter((actividad) => {
        return (
            actividad.title.toLowerCase().includes(busqueda.toLowerCase()) &&
            (filtroInstrumento.length === 0 || filtroInstrumento.some(filtro => actividad.instruments.includes(filtro.value.toLowerCase()))) &&
            (filtroGenero.length === 0 || filtroGenero.some(filtro => actividad.genre.includes(filtro.value.toLowerCase()))) &&
            (filtroAutor.length === 0 || filtroAutor.some(filtro => actividad.admins.includes(filtro.value)))
        );
    });

    //funciones para el popup
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [actividadPopup, setActividadPopup] = useState(null);

    const openPopup = () => {
        setPopupOpen(true);
    };

    const closePopup = () => {
        setPopupOpen(false);
        fetchFilteredActivities();
    };

    const selectMultiStyle = {
        control: (provided) => ({ // class attribute : class=" css-i32vvf-control"
          ...provided,
          background: 'transparent',
          border: 'none',
          fontSize: '16pt'
        }),
        placeholder: (defaultStyles) => {
            return {
                ...defaultStyles,
                color: '#ffffff',
            }
        },
        indicatorSeparator: (provided) => ({
            ...provided,
            display: 'none'
        }),
        option: (base) => ({
            ...base,
            border: "none",
            height: '100%',
            background: '#322272',
            color: '#ffffff',
        }),
        multiValue: (base) => ({
            ...base,
            border: "none",
            height: '100%',
            background: '#ffffff',
            color: '#322272',
        }),
        multiValueLabel: (base) => ({
            ...base,
            border: "none",
            height: '100%',
            background: '#ffffff',
            color: '#322272',
        }),
        menu: (base) => ({
            ...base,
            background: '#322272',
            color: '#ffffff',
            borderRadius: '0.5rem',
            marginTop: '0.5rem',
        }),
      };
    
    

    return (
        <div className={styles.layout}>
            <Navbar usuario={usuario} page="actividades" />
            {/* Barra de búsqueda */}
            <div className={styles.activitiesContent}>
                <div className={styles.filtrosSuperBox}>                
                    <div className={styles.filtrosBox}>
                        {/* Filtros */}
                        {/* Botón para mostrar/ocultar los filtros */}
                        <div className={styles.filtrosHeader + (mostrarFiltros ? " " + styles.selectedHeader : "")} onClick={toggleFiltros}>
                            Filtros
                        </div>
                        <div className={styles.searchBar}>
                            <input
                                type="text"
                                placeholder="Buscar actividades..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        {/* Botón para mostrar/ocultar los filtros */}
                        <div className={styles.filtrosHeader + (mostrarOrden ? " " + styles.selectedHeader : "")} onClick={toggleOrden}>
                            Organizar
                        </div>

                    </div>
                    {/* Navbar de filtros */}
                    {mostrarFiltros && (
                        <div className={styles.filters}>
                            <div className={styles.filter}>
                                <SelectMulti
                                    options={[...instruments.map(instrument => ({ value: instrument, label: instrument }))]}
                                    value={filtroInstrumento}
                                    onChange={setFiltroInstrumento}
                                    placeholder="Instrumentos"
                                    styles={selectMultiStyle}
                                />
                            </div>
                            <div className={styles.filter}>
                                <SelectMulti
                                    options={genres.map(genre => ({ value: genre, label: genre }))}
                                    value={filtroGenero}
                                    onChange={setFiltroGenero}
                                    placeholder="Géneros"
                                    styles={selectMultiStyle}
                                />
                            </div>
                            <div className={styles.filter}>
                                <SelectMulti
                                    options={allUsers.map(user => ({ value: user.nickname, label: user.nickname }))}
                                    value={filtroAutor}
                                    onChange={setFiltroAutor}
                                    placeholder="Autores"
                                    styles={selectMultiStyle}
                                />
                            </div>
                        </div>
                    )}
                    {/* Navbar de ordenación */}
                    {mostrarOrden && (
                        <div className={styles.organizers}>
                            
                            <div className={styles.organizer + " " + styles.isRadio}>
                                <span>A-Z</span>
                                <input
                                    type="radio"
                                    id="AZ"
                                    name="orden"
                                    value="AZ"
                                    checked={selectedOrder === "AZ"}
                                    onChange={handleOrderChange}
                                />
                                <label htmlFor="AZ"></label>
                            </div>

                            <div className={styles.organizer + " " + styles.isRadio}>
                                <span>Z-A</span>
                                <input
                                    type="radio"
                                    id="ZA"
                                    name="orden"
                                    value="ZA"
                                    checked={selectedOrder === "ZA"}
                                    onChange={handleOrderChange}
                                />
                                <label htmlFor="ZA"></label>
                            </div>
                            <div className={styles.organizer + " " + styles.isRadio}>
                                <span>Más reciente</span>
                                <input
                                    type="radio"
                                    id="recent"
                                    name="orden"
                                    value="recent"
                                    checked={selectedOrder === "recent"}
                                    onChange={handleOrderChange}
                                />
                                <label htmlFor="recent"></label>
                            </div>
                            <div className={styles.organizer + " " + styles.isRadio}>
                                <span>Más antiguo</span>
                                <input
                                    type="radio"
                                    id="oldest"
                                    name="orden"
                                    value="oldest"
                                    checked={selectedOrder === "oldest"}
                                    onChange={handleOrderChange}
                                />
                                <label htmlFor="oldest"></label>
                            </div>
                            <div className={styles.organizer}>
                                <span>Completas</span>
                                <input
                                    type="checkbox"
                                    id="completo"
                                    name="completadas"
                                    value="completo"
                                    checked={selectedState === "completo"}
                                    onChange={handleStateChange}
                                />
                                <label htmlFor="completo"></label>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.homeContent}>
                    <h1>Actividades</h1>
                    <div className={styles.formGroup}>
                        
                        {isLoading ? (
                            <Cargando />
                        ) : (actividadesFiltradas.map((actividad, index) => (
                            <div className={styles.cartaContainer}>
                                {/*<CartaActividad key={actividad.id} actividad={actividad} user={usuario} onReload={fetchFilteredActivities} />*/}
                                <CartaActividad key={actividad.id} actividad={actividad} user={usuario}
                                    onReload={fetchFilteredActivities} openPopup={openPopup} actividadPopup={setActividadPopup} />
                            </div>
                        )))
                        }
                        {isPopupOpen && <PopupActivity key={actividadPopup.id} actividad={actividadPopup} user={usuario} onClose={closePopup} />}

                    </div>
                    <AddActivity token={token} />
                </div>
            </div>
        </div>
    );
}