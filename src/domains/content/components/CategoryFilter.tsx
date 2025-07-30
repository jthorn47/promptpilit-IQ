import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="mb-12">
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category, index) => (
          <Button
            key={index}
            variant={index === 0 ? "default" : "outline"}
            size="sm"
            className="mb-2"
            onClick={() => onCategoryChange?.(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};