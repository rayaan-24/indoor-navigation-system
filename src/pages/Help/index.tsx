import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-brand-primary hover:text-brand-secondary transition-colors text-sm cursor-pointer"
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-brand-muted" /> : <ChevronDown className="w-4 h-4 text-brand-muted" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-1 border-t border-slate-100 text-xs text-brand-muted leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I find a classroom or office room?',
      answer: 'You can search for rooms using the autocomplete search bar on the Home page or by navigating to the Locations directory. In the directory, you can also filter by building, floor, or categories (like Classroom, Lab, Department Office).'
    },
    {
      question: 'Can I navigate between different floors?',
      answer: 'Yes! IndoorNav fully supports multi-floor routing. When a route traverses levels, the directions panel will list floor changes (e.g. "Take Staircase B1 up to Floor 2"). You can click the floor tabs above the map to see the layout of each floor level along the route.'
    },
    {
      question: 'Can I avoid stairs for wheelchair accessibility?',
      answer: 'Yes, absolutely. On the Explore/Navigation page, check the "Accessible route (avoid stairs / use elevator)" option. The system will automatically reroute you through elevators instead of stairwells.'
    },
    {
      question: 'What if a route or room is blocked or closed?',
      answer: 'You can report blocked corridors, incorrect room numbers, or missing locations by visiting our "Feedback/Report Issue" page from the footer. The administrator review team will review and update the maps in real time.'
    },
    {
      question: 'Can I save frequently visited locations?',
      answer: 'Yes. On any room detail page, you can click the "Heart" favorite icon. This will bookmark the room to your Favorites shelf, which you can easily access on your User Profile page.'
    },
    {
      question: 'How do I report an incorrect location or map error?',
      answer: 'Navigate to the Feedback page, choose the type of issue (e.g. "Incorrect room", "Blocked path"), describe the discrepancy, and click submit. Our administration portal compiles these issues for immediate map grid adjustments.'
    }
  ];

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-brand-primary">Help Center & FAQ</h1>
        <p className="text-brand-muted text-sm max-w-xl mx-auto">Get quick answers to common indoor wayfinding questions or learn how to browse maps.</p>
      </section>

      {/* Quick Guide */}
      <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-brand-primary flex items-center border-b border-slate-100 pb-3">
          <BookOpen className="w-5 h-5 text-brand-secondary mr-2" />
          <span>Quick Wayfinding Guide</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-brand-muted">
          <div className="space-y-2">
            <span className="font-bold text-brand-primary flex items-center">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-brand-secondary flex items-center justify-center mr-2 font-bold text-xs">1</span>
              Locate Buildings
            </span>
            <p className="leading-relaxed">Browse the Buildings menu, pick your target academic block, and view the floor list map to inspect room locations.</p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-brand-primary flex items-center">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-brand-secondary flex items-center justify-center mr-2 font-bold text-xs">2</span>
              Plot Navigation
            </span>
            <p className="leading-relaxed">Enter your starting point (e.g. Lobby Entrance) and target room, then press "Find Route" to calculate the waypoints path.</p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-brand-primary flex items-center">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-brand-secondary flex items-center justify-center mr-2 font-bold text-xs">3</span>
              Switch Floor Views
            </span>
            <p className="leading-relaxed">If navigation goes upstairs, use the floor selector tabs to see layout adjustments of subsequent floors.</p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-brand-primary flex items-center mb-6">
          <HelpCircle className="w-5 h-5 text-brand-secondary mr-2" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              onToggle={() => handleToggle(idx)}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
