const OurStorySection = () => {
  return (
    <section id="our-story" className="py-16 md:py-24 bg-cream/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 md:mb-12">
            <div className="inline-block bg-primary rounded-2xl px-6 py-4 shadow-lg">
              <span className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                AK <span className="text-gold italic">Fashion Hub</span>
              </span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Our Story
          </h2>

          {/* Subheading */}
          <p className="text-gold font-medium text-lg md:text-xl mb-8">
            Started by Rehana Parveen
          </p>

          {/* Body Content */}
          <div className="space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            <p>
              AK Fashion Hub was started by Rehana Parveen with a simple dream — to bring beautiful, high-quality sarees and dress materials to every woman at honest prices, with the comfort of home delivery.
            </p>
            <p>
              What began as a small local shop in Khammam has grown into a trusted name for women's ethnic wear across Telangana and beyond. Every piece in our collection is handpicked to ensure the finest quality and timeless elegance.
            </p>
            <p>
              We believe that every woman deserves to feel beautiful, and we're committed to making that possible with our curated collections and personalized service.
            </p>
          </div>

          {/* Signature */}
          <div className="mt-10 md:mt-14 pt-8 border-t border-gold/20">
            <p className="font-serif text-xl md:text-2xl font-semibold text-primary">
              Rehana Parveen
            </p>
            <p className="text-gold text-sm md:text-base mt-1">
              Founder, AK Fashion Hub
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
