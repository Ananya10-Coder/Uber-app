import React, {useContext, useEffect} from 'react'
import UserContext, { UserDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
const UserProtectWrapper = ({children}) => {

    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
          navigate("/login");
        }
      }, [token, navigate]);
    return (
        <div>
            {children}
        </div>
    )
}

export default UserProtectWrapper
