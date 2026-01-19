import { useState } from "react";

import designerSaree from "@/assets/category-designer-saree.jpg";
import banarasSaree from "@/assets/category-banaras-saree.jpg";
import dressMaterial from "@/assets/category-dress-material.jpg";
import dailySaree from "@/assets/category-daily-saree.jpg";

interface CategoryCardProps {
  title: string;
  image: string;
  description: string;
}

const CategoryCard = ({ title, image, description }: CategoryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-card shadow-card hover-lift cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary-foreground mb-1">{title}</h3>
        <p className="text-primary-foreground/80 text-sm">{description}</p>
        <div className={`mt-3 h-0.5 bg-gold transition-all duration-300 ${isHovered ? 'w-full' : 'w-12'}`}></div>
      </div>
    </div>
  );
};

const categories = [
  {
    title: "Designer Sarees",
    image: designerSaree,
    description: "Exclusive designer collections"
  },
  {
    title: "Banaras Sarees",
    image: banarasSaree,
    description: "Authentic Banarasi weaves"
  },
  {
    title: "Dress Materials",
    image: dressMaterial,
    description: "Premium unstitched fabrics"
  },
  {
    title: "Daily Wear Sarees",
    image: dailySaree,
    description: "Comfortable everyday elegance"
  }
];

const CategoriesSection = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-3">
            Shop by Category
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full"></div>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Explore our curated collection of ethnic wear, crafted with love and tradition
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div 
              key={category.title} 
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
