import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

export const FAQItem = ({ question, answer, index }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 pr-4">
            {question}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0">
          <p className="text-gray-600 leading-relaxed">
            {answer}
          </p>
        </CardContent>
      )}
    </Card>
  );
};