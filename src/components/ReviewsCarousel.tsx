import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reviews = [
  {
    name: 'Priya Sharma',
    rating: 5,
    review: 'Absolutely stunning saree! The quality exceeded my expectations. Perfect for my sister\'s wedding.',
    location: 'Hyderabad',
  },
  {
    name: 'Anita Reddy',
    rating: 5,
    review: 'Fast delivery and beautiful packaging. The Banaras saree is exactly as shown in the pictures.',
    location: 'Bangalore',
  },
  {
    name: 'Kavitha Rao',
    rating: 5,
    review: 'Best ethnic wear collection in Hyderabad! The staff was very helpful in selecting the right design.',
    location: 'Secunderabad',
  },
  {
    name: 'Meena Devi',
    rating: 5,
    review: 'Quality products at reasonable prices. I\'ve been shopping here for years. Highly recommended!',
    location: 'Warangal',
  },
];

const ReviewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="py-16 bg-gradient-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-gold text-gold" />
            ))}
          </div>
          <p className="text-muted-foreground">4.9 out of 5 based on 500+ reviews</p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-medium">
            <div className="flex gap-1 mb-4">
              {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-gold text-gold" />
              ))}
            </div>
            <p className="text-lg text-foreground mb-6 italic">
              "{reviews[currentIndex].review}"
            </p>
            <div>
              <p className="font-semibold text-foreground">{reviews[currentIndex].name}</p>
              <p className="text-sm text-muted-foreground">{reviews[currentIndex].location}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={prevReview} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={nextReview} className="rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
