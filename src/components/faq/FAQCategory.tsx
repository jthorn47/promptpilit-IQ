import { FAQItem } from "./FAQItem";

interface FAQQuestion {
  question: string;
  answer: string;
}

interface FAQCategoryProps {
  category: string;
  questions: FAQQuestion[];
  categoryIndex: number;
}

export const FAQCategory = ({ category, questions, categoryIndex }: FAQCategoryProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {category}
      </h2>
      
      <div className="space-y-4">
        {questions.map((qa, questionIndex) => (
          <FAQItem
            key={questionIndex}
            question={qa.question}
            answer={qa.answer}
            index={categoryIndex * 100 + questionIndex}
          />
        ))}
      </div>
    </div>
  );
};