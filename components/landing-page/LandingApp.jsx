"use client";

import './index.css';
import './App.css';
import Hero from './Hero'
import ProblemSection from './ProblemSection'
import MultiSensorSection from './MultiSensorSection'
import CorrespondenceSection from './CorrespondenceSection'
import IlluminationSection from './IlluminationSection'
import ScaleSection from './ScaleSection'
import HumanReviewSection from './HumanReviewSection'
import TerrainSection from './TerrainSection'
import ResultsSection from './ResultsSection'
import StatementSection from './StatementSection'
import Footer from './Footer'
import Nav from './Nav'

function App() {
  return (
    <div className="landing-wrapper" style={{ width: '100%' }}>
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