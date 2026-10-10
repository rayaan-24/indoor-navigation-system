import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { helpContent } from '../../content/helpContent';

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
  const { header, quickGuide, faqs } = helpContent;

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-brand-primary">{header.title}</h1>
        <p className="text-brand-muted text-sm max-w-xl mx-auto">{header.subtitle}</p>
      </section>

      {/* Quick Guide */}
      <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-brand-primary flex items-center border-b border-slate-100 pb-3">
          <BookOpen className="w-5 h-5 text-brand-secondary mr-2" />
          <span>{quickGuide.title}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-brand-muted">
          {quickGuide.steps.map((item) => (
            <div key={item.step} className="space-y-2">
              <span className="font-bold text-brand-primary flex items-center">
                <span className="w-5 h-5 rounded-full bg-violet-50 text-brand-secondary flex items-center justify-center mr-2 font-bold text-xs">{item.step}</span>
                {item.title}
              </span>
              <p className="leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-brand-primary flex items-center mb-6">
          <HelpCircle className="w-5 h-5 text-brand-secondary mr-2" />
          <span>{faqs.title}</span>
        </h3>

        <div className="space-y-3">
          {faqs.items.map((faq, idx) => (
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
