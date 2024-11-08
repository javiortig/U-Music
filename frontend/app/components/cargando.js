'use client';


import styles from '../home.module.css'
import { BarLoader } from 'react-spinners';

export default function Cargando() {
    return (
        <div className={styles.spinner}>
            <BarLoader color="#ffffff"/>
        </div>
    )
}