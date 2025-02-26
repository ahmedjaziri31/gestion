// src/components/RequireAuth.tsx
import React, { useEffect } from 'react'
import { Navigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'
import Cookies from 'js-cookie'
import apiClient from '@/lib/apiClient'

interface RequireAuthProps {
  children: JSX.Element
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, setUser, reset } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const validateToken = async () => {
      const tokenCookie = Cookies.get('thisisjustarandomstring')
      
      if (tokenCookie && !user) {
        try {
          // Parse the token to check expiration
          const token = JSON.parse(tokenCookie)
          const [, payloadBase64] = token.split('.')
          
          if (payloadBase64) {
            // Use atob instead of Buffer
            const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
            const payload = JSON.parse(decodedPayload)
            
            // Check if token is expired
            if (payload.exp && payload.exp * 1000 > Date.now()) {
              // Instead of making an API call, use the decoded payload
              setUser({
                accountNo: payload.accountNo,
                email: payload.email,
                role: payload.role,
                exp: payload.exp
              })
            } else {
              // Token is expired
              console.log('Token expired')
              reset()
            }
          }
        } catch (error) {
          console.error('Error validating token:', error)
          // Don't reset if there's just a parsing error
          if (error.response?.status === 401) {
            reset()
          }
        }
      }
    }

    validateToken()
  }, [user, setUser, reset])

  // Debug log
  console.log('Current auth state:', { user, hasToken: !!Cookies.get('thisisjustarandomstring') })

  if (!user) {
    // Only redirect if there's no user AND no valid token
    const tokenCookie = Cookies.get('thisisjustarandomstring')
    if (!tokenCookie) {
      return (
        <Navigate
          to="/sign-in"
          state={{ from: location }}
          replace
        />
      )
    }
    // If there's a token but no user yet, return null to prevent flash of login page
    return null
  }

  return children
}

export default RequireAuth