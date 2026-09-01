import { jwtDecode } from 'jwt-decode'
import React, {useState,useEffect} from 'react'
import api from '../api'
import Loading from '../UI/Loading'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {

    const [isAuthorized, setIsAuthorized] = useState(null)

    const refreshToken = async () =>{
        const refresh_token = localStorage.getItem("refresh_token")
        try{
            const res = await api.post("token/refresh/",{
                refresh : refresh_token
            })
            if (res.status === 200){
                localStorage.setItem("access_token",res.data.access)
                setIsAuthorized(true)
            }
            else{
                setIsAuthorized(false)
            }
        } 
        catch (error) {
            console.log(error)
            setIsAuthorized(false)
        }
    }

    const isAuth = async () => {
        const access_token = localStorage.getItem("access_token")
        if (access_token){
            const decode = jwtDecode(access_token)
            const expiry = decode.exp
            const current_time = Date.now() / 1000
            if (current_time > expiry){
                await refreshToken()
            }
            else{
                setIsAuthorized(true)
            }
            return
        }
        setIsAuthorized(false)
        return
    }

    useEffect(() => {
        isAuth().catch(() => {setIsAuthorized(false)})
    },[])

    if (isAuthorized === null) return <Loading/>

  return isAuthorized ? children : <Navigate to= "/" />
}

export default ProtectedRoute