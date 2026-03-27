import { useParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

export default function TreeView() {
  const { projectId } = useParams()
  return (
    <>
      <div style={{padding:40}}>
        <h1>TreeView Page</h1>
        <p>Project ID: {projectId}</p>
      </div>
      <BottomNav />
    </>
  )
}
