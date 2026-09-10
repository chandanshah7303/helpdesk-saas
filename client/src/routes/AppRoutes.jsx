import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login.jsx";
import Home from "../pages/Home.jsx";
import Register from "../pages/auth/Register.jsx";
import CreateOrganization from "../pages/organizations/CreateOrganization.jsx";
import NotFound from "../pages/NotFound.jsx";
import Settings from "../pages/Settings.jsx";

import DashboardLayout from "../layouts/DashboardLayout.jsx";

import Users from "../pages/admin/Users.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AgentDashboard from "../pages/agent/AgentDashboard.jsx";
import RequesterDashboard from "../pages/requester/RequesterDashboard.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleProtectedRoute from "./RoleProtectedRoute.jsx";
import Tickets from "../pages/tickets/Tickets.jsx";
import TicketDetails from "../pages/tickets/TicketDetails.jsx";
import CreateTicket from "../pages/tickets/CreateTicket.jsx";
import Categories from "../pages/categories/Categories.jsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Root */}
                <Route path="/" element={<Home />} />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/organization/create" element={<CreateOrganization />} />

                {/* Authenticated Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>

                        {/* Admin */}
                        <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/users" element={<Users />} />
                        </Route>

                        {/* Agent */}
                        <Route element={<RoleProtectedRoute allowedRoles={["agent"]} />}>
                            <Route path="/agent/dashboard" element={<AgentDashboard />} />
                        </Route>

                        {/* Requester */}
                        <Route element={<RoleProtectedRoute allowedRoles={["requester"]} />}>
                            <Route path="/requester/dashboard" element={<RequesterDashboard />} />
                        </Route>

                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/tickets/:id" element={<TicketDetails />} />
                        <Route element={<RoleProtectedRoute allowedRoles={["admin", "requester"]} />}>
                            <Route path="/tickets/create" element={<CreateTicket />} />
                        </Route>
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;