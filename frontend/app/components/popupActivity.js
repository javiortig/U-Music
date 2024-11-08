import React from "react";
import { useState } from "react";
import styles from "../popupActivity.module.css";
import Image from "next/image";
import Alertas from "./alertas";

const PopupActivity = ({ actividad: initialActividad, onClose, user }) => {
  // Convert `actividad` to a state variable
  const [actividad, setActividad] = useState(initialActividad);
  const [selectedCheckbox, setSelectedCheckbox] = useState(null);
  const [mensajeAlertas, setMensajeAlertas] = useState(null); 
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [tipoAlerta, setTipoAlerta] = useState('');
  
  const handleMostrarAlerta = (tipo) => {
    setTipoAlerta(tipo);
    setMostrarAlerta(true);
  };

  const handleCloseAlerta = () => {
    setMostrarAlerta(false);
  };


  const numPlaces = actividad.total_places;
  const numMembers = actividad.users.length;

  const freePlaces = numPlaces - numMembers;


  /* Función para obtener el token de las cookies */
  const getToken = () => {
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name.trim() === "token") {
        return value;
      }
    }
    return null;
  };

  const isUserInActivity = () => {
    return actividad.users.some(
      (activityUser) => activityUser.username === user.nickname
    );
  };

  const handleCheckboxChange = (uniqueId) => {
    setSelectedCheckbox(uniqueId);
  };

  const joinActivity = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        "http://localhost:3000/api/activity/addUserToActivity/" + actividad._id,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            instrument: "guitarra", //TODO: elegir instrumento
          }),
        }
      );
      if (response.ok) {
        // Update local state to reflect the joined user
        setActividad((prevActividad) => ({
          ...prevActividad,
          users: [
            ...prevActividad.users,
            { username: user.nickname, instrument: "guitarra" },
          ], // Update this line as per your data structure
        }));

        // pop up de unión correcta

        setTipoAlerta('unido');
        setMostrarAlerta(true);

      } else {
        console.log("Response erronea con status: ", response.status);
      }
    } catch (error) {
      console.log("Error leave actividad: ", error);
    }
  };

  const leaveActivity = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        "http://localhost:3000/api/activity/deleteUserFromActivity/" +
          actividad._id,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      if (response.ok) {
        // Update local state to remove the user
        setActividad((prevActividad) => ({
          ...prevActividad,
          users: prevActividad.users.filter(
            (u) => u.username !== user.nickname
          ),
        }));

        // pop up de salida correcta
        
        setTipoAlerta('salir');
        setMostrarAlerta(true);

      } else {
        console.log("Response erronea con status: ", response.status);
      }
    } catch (error) {
      console.log("Error leave actividad: ", error);
    }
  };

  const renderMembers = () => {

    const messageMemberList = (
      <div>
        {actividad.users.map((element, index) => (
          <div className={styles.memberContainer}>
            <React.Fragment key={index}>
              <span> {element.username} </span>
              <p> {element.instrument} </p>
            </React.Fragment>
          </div>
        ))}
      </div>
    );

    const messageFreePlaces = [];

    for (let i = 1; i < freePlaces; i++) {
      const uniqueId = `freePlace_${i}`;

      messageFreePlaces.push(
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id={uniqueId}
            name={uniqueId}
            checked={selectedCheckbox === uniqueId}
            onChange={() => handleCheckboxChange(uniqueId)}
          />
          <label htmlFor={uniqueId}></label>
          <span> Plaza libre </span>
          <p> Instrumento </p>
        </div>
      );
    }


    return (
      <div>
        {messageMemberList}
        {messageFreePlaces}
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
      <span className = {styles.closeButton} onClick={onClose}> &times; </span>
        <div className = {styles.formPadding}>        
        <div className={styles.imageTextSection}>
          <div className={styles.imageTextContainer}>
            <div className={styles.imageContainer}>
              <div className={styles.imageActividad}>
                <Image
                  src={actividad.image}
                  alt={actividad.title}
                  layout="fill"
                />
              </div>
            </div>
            <div className={styles.cabecera}>
              <div className={styles.topContainer}>
                <h2> {actividad.title} </h2>
              </div>
              <div className={styles.activityData}>
                <div className={styles.topLeft}>
                  {actividad.nextReservation === undefined
                    ? "(esperando confirmación)"
                    : actividad.nextReservation.date +
                      " " +
                      actividad.nextReservation.time_slot +
                      " - " +
                      actividad.nextReservation.classroom_id}
                </div>
                <div className={styles.topRight}></div>
                <div className={styles.bottomLeft}>
                  {actividad.type === "open" ? "Abierta" : "Cerrada"}
                </div>
                <div className={styles.bottomRight}>
                  {actividad.state.charAt(0).toUpperCase() +
                    actividad.state.slice(1)}
                </div>
              </div>
            </div>
          </div>
          </div>
          <div className={styles.links}>
            <a href="/"> Info </a>
            <a href="/"> Sesiones </a>
            {isUserInActivity() ? <a href="/"> Chat </a> : <></>}
          </div>
          <h3 style={{ color: "#322272", textAlign: "left", marginBottom: "1%" }}>
            {" "}
            Descripción{" "}
          </h3>
          <div className={styles.container} contentEditable={false}>
            {actividad.description}
          </div>
          <div className={styles.memberContainer}>
            <h3> Miembros </h3>
            <p> {actividad.state.charAt(0).toUpperCase() + actividad.state.slice(1)} </p>
          </div>
          <div className={styles.container} contentEditable={false}>
            {renderMembers()}
          </div>
        {isUserInActivity() ? ( //Comprueba que el user este en la actividad para mostrar el boton de unirse o salirse.
          <button onClick={leaveActivity}> Salirse </button>
        ) : (
          <button onClick={joinActivity}> Unirse </button>
        )}
      </div>
      {mostrarAlerta && (
        <div className={styles.alerta}>
          <Alertas tipoAlerta={tipoAlerta} mostrar={mostrarAlerta} onClose={handleCloseAlerta} />
        </div>
      )}
      </div>
    </div>
  );
};

export default PopupActivity;
