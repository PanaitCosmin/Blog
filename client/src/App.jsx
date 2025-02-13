import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import './App.css'
import RootLayout from './layout/RootLayout'
import Home from './pages/Home'
import Post from './pages/Post'
import Write from './pages/Write'
import Register from './pages/Register'
import Login from './pages/Login'
import { RouterProvider } from 'react-router'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import Profile from './pages/Profile'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements([
      <Route path ='/' element={<RootLayout />} >
        <Route index element={<Home />} />
        <Route path='posts/:id' element={<Post />} />
        <Route path='write' element={<Write />}  />
        <Route path='profile' element={<Profile />}/>
      </Route>,
      <Route path='/register' element={<Register />}/>,
      <Route path='/login' element={<Login />}/>
    ])
  )

  return (
    <div className="w-full">
      <div className="w-full">
      <Toaster position='bottom-right' toastOptions={{duration: 4000}}/>
        <RouterProvider router={router}/>
      </div>
    </div>
  )
}

export default App
