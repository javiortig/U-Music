// components/addActivity.js
import Link from 'next/link';
import Image from 'next/image';
import styles from '../floating.module.css';
import messageImg from '../../public/images/message.png';

import PopupForo from './popupForo';
import { useState } from 'react';

export default function AddForo({ onReload, tag, reload }) {
  const [isPopupOpen, setPopupOpen] = useState(false);

  const openPopup = () => {
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    onReload(true);
  };
  
  return (
    <div className = {styles.floatingButton}>
      <button onClick={openPopup} className = {styles.foroButton}>
        <Image
            src={messageImg}
            alt="icono de añadir mensaje"
            width={50}
            height={50}
            sizes="100vw"
            style={{ width: 'auto%', height: 'auto' }} // optional
        />  
      </button>     
      {isPopupOpen && <PopupForo onClose={closePopup} tag={tag} />} 
    </div>
  );
};