import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AppProvider } from "./context/AppContext"
import { AppLayout } from "./components/layout/AppLayout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Pedidos from "./pages/Pedidos"
import Clientes from "./pages/Clientes"
import Prendas from "./pages/Prendas"
import Usuarios from "./pages/Usuarios"
import Historial from "./pages/Historial"
import ErrorPage from "./pages/ErrorPage"

const router = createBrowserRouter([
  { path: "/login", element: <Login />, errorElement: <ErrorPage /> },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "pedidos", element: <Pedidos /> },
      { path: "clientes", element: <Clientes /> },
      { path: "prendas", element: <Prendas /> },
      { path: "usuarios", element: <Usuarios /> },
      { path: "historial", element: <Historial /> },
    ],
  },
  { path: "*", element: <ErrorPage /> },
])

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
}
