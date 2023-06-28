import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NavigationBar.module.css';
import myimage from './PS_Logo_RGB.svg.png'

const NavigationBar = () => {
  return (
    <nav className={styles.navBar}>
      <img className={styles.logo} src={myimage} alt='Logo'/>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
