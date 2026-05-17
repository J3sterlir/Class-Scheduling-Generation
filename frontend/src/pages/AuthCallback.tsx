import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { setToken } from '../api'

export default function AuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()

  React.useEffect(() => {
    const token = new URLSearchParams(location.search).get('token')
    if (token) {
      setToken(token)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [location.search, navigate])

  return <div>Signing you in…</div>
}
