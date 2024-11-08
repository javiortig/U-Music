import Image from 'next/image';
import perfilImg from '../../public/images/perfil1.png'
import styles from '../activityCardChat.module.css';

export default function ActivityCardChat({ activity, onClick }) {
  return (
    <div className={styles.activityCard} onClick={() => onClick(activity)}> {/* () => onClick(activity) */}
      <div className={styles.imageContainer}>
        <Image
            src={activity.image}
            alt="Imagen de la actividad"
            width={100}
            height={100}
            sizes="100vw"
            style={{ width: '90px', height: '90px', marginRight: '2%'}}
        />
      </div>
      <div className={styles.title}> {activity.title} </div>
    </div>
  );
};