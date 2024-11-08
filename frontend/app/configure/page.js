'use client';

import { useState } from 'react';
import SelectMulti from "../components/selectMulti";
import styles from "../login.module.css";
import { useRouter } from 'next/navigation';
import { instruments } from '../utils/constants';

export default function Config() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
    bio: '',
    instruments: ['',''],
    availabilitySchedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    receiveNotifications: false
  });

  const [messageUser, setMessageUser] = useState(
    <p> </p>
  );
  const [messagePassword, setMessagePassword] = useState(
    <p> </p>
  );

  const [messageField, setMessageField] = useState(
    <p> </p>
  );

  const [messagePasswordSegura, setMessagePasswordSegura] = useState(
    <p> </p>
  );


  const [configureContent, setconfigureContent] = useState(true);

  const handleConfigureContent = () => {
    setconfigureContent(!configureContent);
  };

  const handleChange = (e) => {
    if(e.target.value == 'on'){
      const value = formData.receiveNotifications;

      setFormData({
        ...formData,
        [e.target.name]: !value
      });
    }else{
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const [password2, setPassword2] = useState('');

  const handlePassword2Change = (e) => {
    const value = e.target.value;
    setPassword2(value);
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    try{
      if(formData.nickname != '' && formData.password != '' && password2 != ''){
        const response = await fetch('http://localhost:3000/api/users/checkNickname/' + formData.nickname, {
          method: 'GET'
        });

        setMessageUser(<p></p>)
        setMessagePassword(<p></p>)
        setMessageField(<p></p>)
        setMessagePasswordSegura(<p></p>)

        const data = await response.json();

        if(data.status == false && password2 == formData.password){
          handleConfigureContent();
        }

        if(data.status == true){
          setMessageUser(<p className={styles.redText}> El nombre de usuario ya existe </p>)
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,17}$/;
        if(!formData.password.match(passwordRegex)){
          setMessagePasswordSegura(<p className={styles.redText}> La contraseña debe tener entre 8 y 16 caracteres, una mayúscula y un número </p>)
        }
        if(password2 != formData.password){
          setMessagePassword(<p className={styles.redText}> Las contraseñas no coinciden </p>)
        }
      }else{
        setMessageField(<p className={styles.redText}> Este campo es obligatorio </p>)
      }
    }catch (error) {
      console.error('Error during configure:', error);
    }
  };

  const [selectedOption1, setSelectedOption1] = useState('');
  const [selectedOption2, setSelectedOption2] = useState('');

  const handleDropdown1Change = (e) => {
    const value = e.target.value;
    setSelectedOption1(value);

    const newArray = [...formData.instruments];
    newArray[0] = value;

    setFormData({
      ...formData,
      [e.target.name]: newArray
    });

    /* Si la opción seleccionada en el primer desplegable coincide con la opción seleccionada en el segundo, 
    deselecciona la opción del segundo desplegable*/
    if (value === selectedOption2) {
      setSelectedOption2('');
      newArray[1] = '';

      setFormData({
        ...formData,
        [e.target.name]: newArray
      });
    }
  };

  const handleDropdown2Change = (e) => {
    const value = e.target.value;
    setSelectedOption2(value);

    const newArray = [...formData.instruments];
    newArray[1] = value;

    setFormData({
      ...formData,
      [e.target.name]: newArray
    });
    /* Si la opción seleccionada en el segundo desplegable coincide con la opción seleccionada en el primero, 
    deselecciona la opción del primero desplegable*/
    if (value === selectedOption1) {
      setSelectedOption1('');
      newArray[0] = '';

      setFormData({
        ...formData,
        [e.target.name]: newArray
      });
    }
  };

  const hours = [
    { value: '9-11', label: '9:00-11:00' },
    { value: '11-13', label: '11:00-13:00' },
    { value: '13-15', label: '13:00-15:00' },
    { value: '15-17', label: '15:00-17:00' },
    { value: '17-19', label: '17:00-19:00' },
    { value: '19-21', label: '19:00-21:00' },
  ];

  const [selectedOption, setSelectedOption] = useState('');

  const handleSelectChange = (selectedValue, name) => {
    const array = [...name];

    setFormData((formData) => {
      return({
        ...formData,
        availabilitySchedule: {
          ...formData.availabilitySchedule,
          [name]: selectedValue.value,
        }
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = new URLSearchParams(window.location.search).get('token');

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        // Save token as cookie
        document.cookie = `token=${data.token}; path=/`;
        // Redirect user
        router.push('/home');
      } else {
        console.error('Register failed');
      }
    } catch (error) {
      console.error('Error during register:', error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.configureBox}>
        <div className={styles.center}>
          <h2> Configura tu cuenta </h2> 
        </div>
        <div>
          {configureContent ? (
            <form>
              <div className={styles.formGroup}>
                <label htmlFor="email"> Nombre de usuario: </label>
                <input type="text" className={styles.inputLine} id="userName" name="nickname" placeholder="x x x x x x x x x"  onChange={handleChange} required/>
                <div>
                  {messageUser}
                </div>
                <div>
                  {messageField}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password"> Contraseña: </label>
                <input type="password" className={styles.inputLine} id="password" name="password" placeholder="• • • • • • • •"  onChange={handleChange} required/>
                <div>
                  {messageField}
                </div>
                <div>
                  {messagePasswordSegura}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password"> Verifica tu contraseña: </label>
                <input type="password" className={styles.inputLine} id="password2" name="password" placeholder="• • • • • • • •"  onChange={handlePassword2Change} required/>
                <div>
                  {messagePassword}
                </div>
                <div>
                  {messageField}
                </div>
              </div>
              <div className={styles.formGroup}>                
                <div className={styles.checkboxContainer}>
                  <input type="checkbox" id="notifications" name="receiveNotifications" onChange={handleChange}/>
                  <label htmlFor="notifications"></label>
                  <span>Deseo recibir notificaciones por correo</span>
                </div>
              </div>
              <div className={styles.formGroup}>
                <button onClick={handleCheck}> Siguiente </button>
              </div>
            </form>
          ) : (
            <form>
              <div className={styles.formGroup}>
                <label> ¿Qué instrumento tocas?: </label>
                <div className={styles.dropdownContainer}>
                  <select className={styles.dropdown} name="instruments" value={selectedOption1} onChange={handleDropdown1Change}>
                    <option value=""> </option>
                    {instruments.map((option, index) => (
                      <option key={index} value={option} disabled={option === selectedOption2}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select className={styles.dropdown} name="instruments" value={selectedOption2} onChange={handleDropdown2Change}>
                    <option value=""> </option>
                    {instruments.map((option, index) => (
                      <option key={index} value={option} disabled={option === selectedOption1}>
                        {option}
                      </option>
                    ))}
                  </select>    
                </div>
                <div className={styles.biographyContainer}>
                  <label htmlFor="bio"> Biografía: </label>
                  <textarea className={styles.inputBio} id="bio" name="bio" placeholder="Escribe sobre ti..." onChange={handleChange}/>
                </div>
                <div className={styles.availabilitySchedule}>
                  <label htmlFor="availabilitySchedule"> Horario de disponibilidad: </label>
                  <table>
                  <tr>
                    <th> Día </th>
                    <th> Hora </th>
                  </tr>
                  <tr>
                    <td><bold> Lunes: </bold></td>
                    <td><SelectMulti options={hours} onChange={(selectedOption) => handleSelectChange(selectedOption, "monday")} placeholder="HH:MM"/></td>
                  </tr>
                  <tr>
                    <td><bold> Martes: </bold></td>
                    <td><SelectMulti options={hours} onChange={(selectedOption) => handleSelectChange(selectedOption, "tuesday")} placeholder="HH:MM"/></td>
                  </tr>
                  <tr>
                    <td><bold> Miércoles: </bold></td>
                    <td><SelectMulti options={hours} onChange={(selectedOption) => handleSelectChange(selectedOption, "wednesday")} placeholder="HH:MM"/></td>
                  </tr>
                  <tr>
                    <td><bold> Jueves: </bold></td>
                    <td><SelectMulti options={hours} onChange={(selectedOption) => handleSelectChange(selectedOption, "thursday")} placeholder="HH:MM"/></td>
                  </tr>
                  <tr>
                    <td><bold> Viernes: </bold></td>
                    <td><SelectMulti options={hours} onChange={(selectedOption) => handleSelectChange(selectedOption, "friday")} placeholder="HH:MM"/></td>
                  </tr>
                  <tr>
                    <td><bold> Sábado: </bold></td>
                    <td><SelectMulti options={hours} onChange={(selectedOption) => handleSelectChange(selectedOption, "saturday")} placeholder="HH:MM"/></td>
                  </tr>
                  <tr>
                    <td><bold> Domingo: </bold></td>
                    <td><SelectMulti options={hours} onChange={(selectedOption) => handleSelectChange(selectedOption, "sunday")} placeholder="HH:MM"/></td>
                  </tr>
                  </table>
                  {/*<textarea className={styles.inputBio} id="availabilitySchedule" name="availabilitySchedule" placeholder="Escribe tu disponibilidad horaria..." onFocus="" />*/}
                </div>
                <div className={styles.linkGroup}>
                <a className={styles.link} onClick={handleConfigureContent}>Atrás</a>
                </div>
              </div>
              <div className={styles.formGroup}>
                <button onClick={handleSubmit}> Registrar </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}