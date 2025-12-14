import resumeData from "./data/resume.json";
import { SectionTitle } from "./components/SectionTitle";
import { Card } from "./components/Card";
import { List } from "./components/List";
import { WorkItem } from "./components/WorkItem";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#141417] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#141417]/80 backdrop-blur-[10px] border-b border-[#292929]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-medium">Yassine&apos;s Resume</h1>
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-[#292929] rounded-md hover:bg-white/5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="mb-24" id="hero">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Name */}
            <div>
              <h1 className="text-[80px] lg:text-[120px] font-bold leading-[0.85] tracking-tight mb-8">
                {resumeData.name.split(' ')[0]}<br />
                {resumeData.name.split(' ')[1]}
              </h1>
            </div>

            {/* Right: Profile and Bio */}
            <div className="flex flex-col gap-6">
              {/* Profile Image */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 rotate-[-5deg] hover:rotate-0 transition-transform">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-3xl">
                  👤
                </div>
              </div>

              {/* About Card */}
              <Card title={resumeData.about.title}>
                <ul className="space-y-2">
                  <li className="text-white text-base">{resumeData.about.items[0]}</li>
                  {resumeData.about.items.slice(1).map((item, index) => (
                    <li key={index} className="text-[#919191] text-base">{item}</li>
                  ))}
                </ul>
              </Card>

              {/* Short Bio */}
              <p className="text-base text-[#919191] leading-relaxed">
                {resumeData.about.bio}
              </p>
            </div>
          </div>
        </section>

        {/* Competences Section */}
        <section className="mb-24" id="proficiencies">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            {/* Left: Title */}
            <div>
              <SectionTitle>{resumeData.competences.title}</SectionTitle>
            </div>

            {/* Right: Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card title={resumeData.competences.skills.title}>
                <List items={resumeData.competences.skills.items} />
              </Card>

              <Card title={resumeData.competences.outils.title}>
                <List items={resumeData.competences.outils.items} />
              </Card>

              <Card title={resumeData.competences.techStack.title}>
                <List items={resumeData.competences.techStack.items} />
              </Card>

              <Card title={resumeData.competences.langues.title}>
                <List items={resumeData.competences.langues.items} />
              </Card>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="mb-24" id="work">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            {/* Left: Title */}
            <div>
              <SectionTitle>{resumeData.experience.title}</SectionTitle>
            </div>

            {/* Right: Work List */}
            <div>
              <ul className="space-y-8">
                {resumeData.experience.jobs.map((job) => (
                  <WorkItem
                    key={job.id}
                    title={job.title}
                    company={job.company}
                    period={job.period}
                    location={job.location}
                    description={job.description}
                    isCurrent={job.isCurrent}
                  />
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

