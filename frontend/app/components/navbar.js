import Link from "next/link";
import styles from '../navbar.module.css'
import Image from "next/image";


import utadLogo from '../../public/images/logo2.png'
//import perfilImg from '../../public/images/perfil1.png'

export default function Navbar({ usuario, page }) {
    
    const pagina = page;

    return (
        <nav className={styles.navbar}>
            <div className={styles.links}>
                <Link href="/home">
                    <div className={styles.link}>
                        <Image
                            src={utadLogo}
                            alt="logo U-tad"
                            width={100}
                            height={100}
                            sizes="100vw"
                            style={{ width: '100%', height: 'auto'}}
                        />
                    </div>
                </Link>
            </div>
            {pagina === "home" ? <div className={styles.paginaActual}>
                <a href="/home"> Home </a>
                </div>
                : <a href="/home"> Home </a>}
            {pagina === "actividades" ? <div className={styles.paginaActual}>
                <a href="/activities"> Actividades </a>
                </div>
                : <a href="/activities"> Actividades </a>}
            {pagina === "foro" ? <div className={styles.paginaActual}>
                <a href="/foro"> Foro </a>
                </div>
                : <a href="/foro"> Foro </a>}
            {pagina === "chats" ? <div className={styles.paginaActual}>
                <a href="/chats"> Chats </a>
                </div>
                : <a href="/chats"> Chats </a>}
            
            <div className={styles.perfil}>
                <Link href="/perfil">
                    <div className={styles.imgPerfil}>
                        <Image
                            src={usuario.image}
                            alt="imgPerfil"
                            width={100}
                            height={80}
                            sizes="100vw"
                            style={{ width: '70%', height: '70%', borderRadius: '50%'}}
                        />
                    </div>
                </Link>
            </div>    
        </nav>
    )
}