"use client";

import PopupCreateActivity from "./popupCreateActivity";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../perfil.module.css";
import homeStyles from "../home.module.css";
import CartaReserva from "./cartaReserva";
import AddActivity from "../components/addActivity";
import PopupReserva from "./popupReserva";
import Cargando from "./cargando";

export default function ReservaAulas() {
  const [reservations, setReservations] = useState(null);
  const [activities, setActivities] = useState(null);
  const [combinedActivities, setCombinedActivities] = useState(null);
  const [user, setUser] = useState({});
  const [token, setToken] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [popupReservation, setPopupReservation] = useState(null);
  const [popupActivity, setPopupActivity] = useState(null);
  
  const openPopup = (activity, reservation) => {
    setPopupOpen(true);
    setPopupReservation(reservation);
    setPopupActivity(activity);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setPopupReservation(null);
    setPopupActivity(null);
  };

  useEffect(() => {
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

    setToken(getToken());

    const combine = async () => {
      const tempReservations = await fetchReservas();
      const tempActivities = await fetchActivities();

      setCombinedActivities(combineReservationsWithActivities(tempReservations, tempActivities));
    }

    function combineReservationsWithActivities(reservations, activities) {
      let combinations = reservations.map(reservationsInActivity => {
        const activity = activities.find(activity => activity.title === reservationsInActivity.activityName);

        return {
          ...reservationsInActivity,
          image: activity ? activity.image : undefined,
          title: activity ? activity.title : undefined,
          activity_id: activity ? activity._id : undefined
        };
      });

      // Return the combined reservations
      return combinations;
    }


    const fetchActivities = async () => {
      try {
        const userCall = await fetch(
          "http://localhost:3000/api/users/getUserProfile",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          }
        );

        if (userCall.ok) {
          const dataUser = await userCall.json();
          setUser(dataUser.user);
        }

        const response = await fetch(
          "http://localhost:3000/api/activity/getCreatedActivitiesProfile",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + getToken(), // Función para obtener el token de las cookies
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          setActivities(data);

		  return data;
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    const fetchReservas = async () => {
      try {

        const reservationsResponse = await fetch(
          "http://localhost:3000/api/reservations/getReservationsFromAdmin",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          }
        );

        if (!reservationsResponse.ok) {
          throw new Error("Failed to fetch reservas");
        }

        const data = await reservationsResponse.json();

        setReservations(data);

		return data;

      } catch (error) {
        console.error("Error fetching reservas:", error);
      }
    };

	  // General function to combine reservations and activities
	  combine();
    
  }, []);

  if (!combinedActivities || !user) {
    return (
      <div className={styles.actividadesContent}>
        <Cargando />
      </div>
    );
  }
  else{
    console.log(activities);
  }
  return (
    <div >
      {reservations.length > 0 ? (
        <div>
          <div className={styles.actividadesContent}>
            {combinedActivities.map((activity, index) => (
                <div key={index}>
                  <CartaReserva
                    key={activity.id}
                    activity={activity}
                    user={user}
                    openPopup={openPopup}
                  />
                </div>
              ))
            }
            {isPopupOpen && <PopupReserva reserva={popupReservation} activity={popupActivity} user={user} onClose={closePopup} />}
          </div>
          <AddActivity token={token} />
        </div>
      ) : (
        <div className={styles.messageContainer}>
          <p>
            {" "}
            Aún no has creado ninguna actividad... ¡Crea actividades para poder
            reservar aulas!
          </p>
        </div>
      )}
    </div>
  );
}
