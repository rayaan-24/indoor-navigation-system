import { Compass, Cpu, Code, HelpCircle } from 'lucide-react';
import { aboutContent } from '../../content/aboutContent';

export default function About() {
  const { hero, problem, solution, roadmap, techStack } = aboutContent;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand-primary leading-tight">
          {hero.titleLine1} <br />
          <span className="text-brand-secondary">{hero.titleLine2}</span>
        </h1>
        <p className="text-brand-muted text-base leading-relaxed">
          {hero.subtitle}
        </p>
      </section>

      {/* Problem & Solution Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        
        {/* The Problem */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <div className="h-10 w-10 bg-red-50 text-brand-accent-dest rounded-lg flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-brand-primary">{problem.title}</h3>
          <p className="text-sm text-brand-muted leading-relaxed">
            {problem.description}
          </p>
        </div>

        {/* Our Solution */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <div className="h-10 w-10 bg-emerald-50 text-brand-accent-loc rounded-lg flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-brand-primary">{solution.title}</h3>
          <p className="text-sm text-brand-muted leading-relaxed">
            {solution.description}
          </p>
        </div>

      </section>

      {/* Roadmap Steps */}
      <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-brand-primary text-center mb-8">{roadmap.title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmap.steps.map((item, idx) => (
            <div key={idx} className="space-y-2 border-l-2 border-brand-secondary pl-4 py-1">
              <span className="text-xs font-bold text-brand-secondary uppercase tracking-widest">{item.title}</span>
              <p className="text-xs text-brand-muted leading-normal">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Info */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold text-brand-primary flex items-center justify-center">
            <Cpu className="w-6 h-6 text-brand-secondary mr-2" />
            <span>{techStack.title}</span>
          </h3>
          <p className="text-brand-muted text-xs font-medium uppercase tracking-wider">MERN Stack Backend & React Frontend</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {techStack.items.map((tech) => (
            <div key={tech.name} className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center justify-center p-1.5 bg-violet-50 text-brand-secondary rounded-lg mb-4">
                  <Code className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-brand-primary text-sm">{tech.name}</h4>
                <p className="text-[10px] text-brand-secondary font-semibold uppercase tracking-wider">{tech.role}</p>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
