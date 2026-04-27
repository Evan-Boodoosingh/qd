import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import Ticker from './components/Ticker/Ticker'
import Calendar from './components/Calendar/Calendar'
import Friends from './components/Friends/Friends'

function App() {
  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />
      <Hero />
      <Ticker />
      <Calendar />
      <Friends />
    </div>
  )
}

export default App