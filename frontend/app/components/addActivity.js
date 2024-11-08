// components/addActivity.js
import Link from 'next/link';
import Image from 'next/image';
import styles from '../floating.module.css';
import masImg from '../../public/images/mas.png';

import PopupCreateActivity from './popupCreateActivity';
import { useState } from 'react';

const AddActivity = ({token}) => {
  const [isPopupOpen, setPopupOpen] = useState(false);

    const openPopup = () => {
        setPopupOpen(true);
    };

    const closePopup = () => {
        setPopupOpen(false);
    };
  return (
    <div className = {styles.floatingButton}>
      <button onClick={openPopup}>
        <Image
              src={masImg}
              alt="icono de añadir actividad"
              width={60}
              height={60}
              sizes="100vw"
              style={{ width: 'auto%', height: 'auto' }} // optional
            />  
      </button>     
      {isPopupOpen && <PopupCreateActivity onClose={closePopup} token = {token}/>} 
    </div>
  );
};

export default AddActivity;
