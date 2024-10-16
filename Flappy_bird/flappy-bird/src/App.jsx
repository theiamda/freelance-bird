import './App.css'
import Game from './Components/Game'
import { Route, Routes } from 'react-router-dom'
import Store from './Components/Store'
import { BirdProvider } from './Components/BirdContext'
import Home from './Components/Home'
import Leaderboard from './Components/Leaderboard'

function App() {
  return (
    <>
    <div className='main-container'>
      <BirdProvider>
      <Routes>
        <Route index element={<Home></Home>}></Route> 
        <Route path='store' element={<Store></Store>}></Route> 
        <Route path='home' element={<Game/>}></Route> 
        <Route path='leader' element={<Leaderboard></Leaderboard>}></Route> 
      </Routes>
      </BirdProvider>
    </div>
    </>
  )
}

export default App
