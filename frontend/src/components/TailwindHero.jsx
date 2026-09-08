import React from "react";

const TailwindHero = ({ slides = [], active = 0, onChange }) => {
  const current = slides[active] || slides[0] || {};

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <img
            key={s.id || i}
            src={s.image}
            alt=""
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ objectPosition: s.position || "center center" }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />

      <div className="relative max-w-7xl mx-auto px-6 py-28 lg:py-36">
        <div className="max-w-2xl text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-zg-teal-soft">
            {current.eyebrow}
          </p>

          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight">
            <span className="block">{current.title || "Discover Zanzibar."}</span>
          </h1>

          <p className="mt-4 text-lg text-zg-teal-soft/90">
            {current.description}
          </p>

          <div className="mt-8 flex gap-3">
            <a href="#tours" className="inline-flex items-center gap-3 bg-zg-deep-teal text-white px-4 py-2 rounded-md shadow hover:brightness-95">
              <span>Explore Experiences</span>
            </a>

            <a href="#about" className="inline-flex items-center gap-3 border border-white/20 px-4 py-2 rounded-md text-white/90 hover:text-white">
              Discover Zan Gates
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TailwindHero;
