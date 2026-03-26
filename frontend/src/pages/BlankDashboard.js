import { useNavigate } from 'react-router-dom'
import '../styles/BlankDashboard.css'

const BlankDashboard = () => {
  const navigate = useNavigate()

  return (
    <div className="blank-dash">
      <p className="blank-dash__label">blank dashboard</p>
      <button
        type="button"
        className="blank-dash__cta"
        onClick={() => navigate('/dashboard/plant-your-next-adventure')}
      >
        Plant your next adventure
      </button>
    </div>
  )
}

export default BlankDashboard
