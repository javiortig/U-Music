import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Image from 'next/image';

import styles from '../carousel.module.css';
import imgGenerica from '../../public/images/background-login-image.png';


const Carousel = (props) => {
  const settings = {
    className: "center",
    centerMode: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    color: '#ffffff',
  };

  const [activities, setActivities] = useState([]);

  useEffect(() => {
      const fetchActivities = async () => {
          try {
              const token = props.token;
              const response = await fetch('http://localhost:3000/api/activity/getImportantActivities', {
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
  }, []);

  return (
    
    <div className={styles.carousel}>
      <Slider {...settings}>
        {activities.map((actividad, index) => (
          <div className={styles.imgCarrouselBox} onClick={() => {props.openPopup(actividad)}}>
            <div className={styles.imgCarrousel}>
              <Image
                src={actividad.image}
                alt={actividad.title}
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className={styles.imgCarrouselText}>
              <h4>{actividad.title}</h4>
              <p>Estado: {actividad.state}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;