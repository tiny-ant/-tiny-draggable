import { Outlet } from 'react-router-dom'
import logo from '../../logo.svg'
import './index.css'

export default function Layout() {
  return (
    <div className="App-container">
      <header className="App-header">
        <img src={logo} className="App-logo" style={{ width: 64 }} />
      </header>
      <div className="App-content">
        <Outlet />
      </div>
    </div>
  )
}
