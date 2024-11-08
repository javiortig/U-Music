import React from "react";
import { useState } from "react";
import styles from "../popupReserva.module.css";
import Image from "next/image";
import Alertas from "./alertas";
import Link from "next/link";
import '../popupReserva.css';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../customSlick.css'; //Para cambiar los estilos del carousel por defecto

import Select from 'react-select';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PopupReserva = ({ reserva, activity, onClose, user }) => {
  const [formData, setFormData] = useState({
    date: '',
    time_slot: '',
    classroom_id: ''
  });
  const [date, setDate] = useState(new Date()); // La fecha que se muestra en el selector
  const slider = React.useRef(null);

  const sliderSettings = {
    className: "center",
    centerMode: true,
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  const hours = [
    { value: "9-11", label: "9-11" },
    { value: "11-13", label: "11-13" },
    { value: "13-15", label: "13-15" },
    { value: "15-17", label: "15-17" },
    { value: "17-19", label: "17-19" },
    { value: "19-21", label: "19-21" }
  ];

  const rooms = [
    { value: "BE101", label: "BE101" },
    { value: "BE202", label: "BE202" },
    { value: "BE211", label: "BE211" },
    { value: "BE301", label: "BE301" },
    { value: "MD221", label: "MD221" },
    { value: "MD134", label: "MD134" }
  ];

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

  const handleNext = () => {
    slider?.current?.slickNext();
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date: date });
    setDate(date);
  };

  const handleTimeSlotChange = (selectedOption) => {
    setFormData({ ...formData, time_slot: selectedOption.value });
  };

  const handleRoomChange = (selectedOption) => {
    setFormData({ ...formData, classroom_id: selectedOption.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent form from causing a page reload
    
    const rawDate = (formData.date ? formData.date : new Date());
    const date = rawDate.getDate() + "/" + (rawDate.getMonth() < 9 ? "0" : "") + (rawDate.getMonth() + 1) + "/" + rawDate.getFullYear();

    const classroomNumber = formData.classroom_id.slice(2);
    const rawBuilding = formData.classroom_id.slice(0, 2);
    let building;

    if (rawBuilding === "BE") {
      building = "Berlín";
    } else if (rawBuilding === "MD") {
      building = "Madrid";
    }

    try {
      let reservationId;
      if (reserva) {
        reservationId = reserva._id;
      } else {
        const response = await fetch(
          "http://localhost:3000/api/reservations/addReservation/" + activity.activity_id,
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              Authorization: "Bearer " + getToken(),
            },
            body: JSON.stringify({
              date: date,
              time_slot: formData.time_slot,
            })
          }
        )

        const responseData = await response.json();
        if (response.ok) {
          reservationId = responseData._id;
        } else {
          // Handle errors or unsuccessful submissions here
          console.error('Failed to submit: ', responseData);
        }
      }
      const response = await fetch(
        "http://localhost:3000/api/reservations/reserveClassroom/" + reservationId,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + getToken(),
          },
          body: JSON.stringify({
            classroomNumber: classroomNumber,
            date: date,
            time_slot: formData.time_slot,
            building: building
          })
        }
      );
      const responseData = await response.json();
      if (response.ok) {
        // Handle successful submission here, e.g., closing the popup or displaying a success message
        onClose();
      } else {
        // Handle errors or unsuccessful submissions here
        console.error('Failed to submit: ', responseData);
      }
    } catch (error) {
      console.error('Failed to send request: ', error);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <span className={styles.closeButton} onClick={onClose}>{" "}&times;{" "}</span>

        <Slider ref={slider} {...sliderSettings} styles={{ width: '100%', height: '100%' }}>
          <div>
            <h1 className={styles.title}>RESERVAR <br /> AULA</h1>
            <p className={styles.bodyText}>Puedes encontrar información de las aulas en:</p>
            <Link href="https://mese.webuntis.com/WebUntis/?school=U-TAD#/basic/timetable" className={styles.nextLink} target="_blank">
              https://mese.webuntis.com/WebUntis/?school=U-TAD#/basic/timetable
            </Link>
            <div className={styles.iframeContainer}>
              <iframe className={styles.iframe} src="https://mese.webuntis.com/WebUntis/?school=U-TAD#/basic/timetable" />
            </div>
            <br/>
            <button className={styles.buttonSend} onClick={handleNext}> Siguiente </button>
          </div>

          <form>
            <h1 className={styles.title}>RESERVAR <br /> AULA</h1>
            <div className={styles.inputContainer}>
              <p className={styles.pText}>Fecha:</p>
              <DatePicker selected={date} onChange={handleDateChange} />
            </div>
            <div className={styles.inputContainer}>
              <p className={styles.pText}>Franja<br /> Horaria:</p>
              <Select menuPlacement="top" className={styles.inputSelect} onChange={handleTimeSlotChange}
                options={hours}
              />
            </div>
            <div className={styles.inputContainer}>
              <p className={styles.pText}>Aula:</p>
              <Select menuPlacement="top" className={styles.inputSelect} onChange={handleRoomChange}
                options={rooms}
              />
            </div>
            <button className={styles.buttonSend} onClick={handleSubmit}> Enviar solicitud </button>
          </form>
        </Slider>
      </div>
    </div>


  );
};
export default PopupReserva;