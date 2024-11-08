'use client';

import { useEffect, useState } from 'react';
import Cargando from "../components/cargando";
import styles from '../confirmar-reserva.module.css';

export default function ConfirmarReserva() {
	const [token, setToken] = useState(null);
	const [reservationId, setReservationId] = useState(null);
	const [classroomNumber, setClassroomNumber] = useState(null);
	const [building, setBuilding] = useState(null);
	const [email, setEmail] = useState(null);
	const [activityTitle, setActivityTitle] = useState(null);
	const [date, setDate] = useState(null);
	const [timeSlot, setTimeSlot] = useState(null);

	const [confirmationMessage, setConfirmationMessage] = useState(null);
	
	useEffect(() => {
		setToken(new URLSearchParams(window.location.search).get('token'));
		setReservationId(new URLSearchParams(window.location.search).get('id'));
		setClassroomNumber(new URLSearchParams(window.location.search).get('classroomNumber'));
		setBuilding(new URLSearchParams(window.location.search).get('building'));
		setEmail(new URLSearchParams(window.location.search).get('email'));
		setActivityTitle(new URLSearchParams(window.location.search).get('activity'));
		setDate(new URLSearchParams(window.location.search).get('date'));
		setTimeSlot(new URLSearchParams(window.location.search).get('timeSlot'));
	}, []);

	const handleSubmit = async (accept) => {
		try {	
		  const response = await fetch('http://localhost:3000/api/reservations/acceptOrRejectClassroom/' + reservationId, {
			method: 'PUT',
			headers: {
			  'Content-Type': 'application/json',
			  'Authorization': 'Bearer ' + token
			},
			body: JSON.stringify({
			  accept: accept,
			  classroomNumber: classroomNumber,
			  building: building
			})
		  });
	
		  if (response.ok) {
			setConfirmationMessage(accept ? 'Reserva aceptada' : 'Reserva rechazada');
		  } else {
			console.error('Confirmation failed');
			console.log(reservationId);
			console.log(JSON.stringify({
				accept: accept,
				classroomNumber: classroomNumber,
				building: building
			  }))
		  }
		} catch (error) {
		  console.error('Error during reservation confirmation:', error);
		}
	  };

	  if (!token || !reservationId || !classroomNumber || !building) {
		return (
			<div className={styles.layout}>
				<Cargando />
			</div>
		);
	  }

	return (
		<div className={styles.layout}>
			<p className={styles.information}>El usuario <b>{email}</b> quiere reservar el aula <b>{classroomNumber}</b> del edificio <b>{building}</b> para la actividad <b>{activityTitle}</b> en la fecha <b>{date}</b> y franja horaria <b>{timeSlot}</b>.</p>
			{confirmationMessage
				? <p className={styles.confirmation}>{confirmationMessage}</p>
				: <div className={styles.buttons}>
					<button onClick={() => handleSubmit(true)}>Confirmar</button>
					<button onClick={() => handleSubmit(false)}>Rechazar</button>
				</div>
			}
		</div>
  	);
}
