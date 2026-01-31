import React, {useContext, useEffect} from 'react'
import CaptainContext, { CaptainDataContext } from '../context/CaptainContext'
import { useNavigate } from 'react-router-dom'
const CaptainProtectWrapper = ({children}) => {

    const captainToken = localStorage.getItem('captainToken')
    const navigate = useNavigate()

    useEffect(() => {
        if (!captainToken) {
          navigate("/captain-login");
        }
      }, [captainToken, navigate]);
    return (
        <div>
            {children}
        </div>
    )
}

export default CaptainProtectWrapper
