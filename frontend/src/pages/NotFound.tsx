import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Not found</h2>
      <Link to="/">Go home</Link>
    </div>
  )
}
