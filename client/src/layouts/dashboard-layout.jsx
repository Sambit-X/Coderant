import * as React from 'react'
import { useAuth } from "@clerk/clerk-react"
import { Outlet, useNavigate } from "react-router-dom"

export default function DashboardLayout() {
    const { userId, isLoaded } = useAuth()
    const navigate = useNavigate()

    console.log('test', userId)

    React.useEffect(() => {
        if (isLoaded && !userId) {
            navigate("/sign-in")
        }
    })

    if (!isLoaded) return (
        <>
            <div className="container-fluid bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
                <div className="text-center">
                    <p className="lead">Loading Your Dashboard</p>
                </div>
            </div>
        </>
    )
    return (
        <Outlet />
    )
}