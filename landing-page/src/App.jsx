import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import MultiSensorSection from './components/MultiSensorSection'
import CorrespondenceSection from './components/CorrespondenceSection'
import IlluminationSection from './components/IlluminationSection'
import ScaleSection from './components/ScaleSection'
import HumanReviewSection from './components/HumanReviewSection'
import TerrainSection from './components/TerrainSection'
import ResultsSection from './components/ResultsSection'
import StatementSection from './components/StatementSection'
import Footer from './components/Footer'
import Nav from './components/Nav'

function App() {
  return (
    <div style={{ width: '100%' }}>
      <Nav />
      <Hero />
      <ProblemSection />
      <MultiSensorSection />
      <CorrespondenceSection />
      <IlluminationSection />
      <ScaleSection />
      <HumanReviewSection />
      <TerrainSection />
      <ResultsSection />
      <StatementSection />
      <Footer />
    </div>
  )
}

export default App