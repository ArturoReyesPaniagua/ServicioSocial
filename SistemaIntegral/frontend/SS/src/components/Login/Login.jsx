import axios from 'axios';
import  {useState} from 'react';
import { useNavigate } from 'react-router-dom';

function Login(){
    
    return(
    <div className="form">

        <div className="form_login">
           <h1>Login</h1>
           <input type="text" placeholder="Username" /> <br/>
           <input type="password" placeholder="Password" />
             <br/>
           <button >Login</button>
        </div>
     </div>
    )
    }




export default Login;