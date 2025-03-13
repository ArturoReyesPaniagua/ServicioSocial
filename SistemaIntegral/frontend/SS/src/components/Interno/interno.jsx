import React from 'react'
import { Routes, Route } from 'react-router-dom';
import SideBar from '../sideBar/sideBar';
import RegisterForm from '../Registration/Registration';
import Expedientes from '../Expedientes/expediente';

function Interno() {
    return (
        <div>
            <div>
               <SideBar />
            </div>
            <Expedientes/>
        </div>
    )
}

export default Interno;