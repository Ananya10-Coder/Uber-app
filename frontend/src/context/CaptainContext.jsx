import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const CaptainDataContext = createContext()

const CaptainContext = ({ children }) => {
    const [captain, setCaptain] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('captainToken')

        if (!token) {
            setIsLoading(false)
            return
        }

        axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            setCaptain(res.data)
        })
        .catch(() => {
            localStorage.removeItem('captainToken')
        })
        .finally(() => {
            setIsLoading(false)
        })
    }, [])

    return (
        <CaptainDataContext.Provider value={{ captain, setCaptain, isLoading }}>
            {children}
        </CaptainDataContext.Provider>
    )
}

export default CaptainContext
