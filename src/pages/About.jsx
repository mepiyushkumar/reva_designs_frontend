import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const fadeIn = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const DEFAULTS = {
  about_hero_title: 'About Reva Designs',
  about_hero_subtitle: 'Our Story',
  about_story_heading: 'Elegance Crafted in Every Stitch',
  about_story_text: 'Reva Designs was born from a shared passion for preserving the artistry of Indian textiles while reimagining them for the modern woman. Founded by Preethi Kumari and Macherala Swapna, our brand is a celebration of heritage, craftsmanship, and contemporary elegance.\n\nEvery piece in our collection tells a story — of the artisan who wove it, the tradition it honors, and the woman who will make it her own.',
  about_founder1_name: 'Preethi Kumari',
  about_founder1_role: 'Co-Founder',
  about_founder1_desc: 'With an eye for design and a heart for tradition, Preethi brings creative vision to every collection.',
  about_founder2_name: 'Macherala Swapna',
  about_founder2_role: 'Co-Founder',
  about_founder2_desc: "Swapna's expertise in textiles and business strategy drives Reva's commitment to quality and excellence.",
  about_mission: 'To make luxury ethnic fashion accessible while preserving the ancient craft traditions of India.',
  about_vision: "To become India's most trusted destination for premium handcrafted ethnic wear.",
  about_promise: 'Every garment is a promise of quality, authenticity, and timeless elegance.',
};

export default function About() {
  const [s, setS] = useState(DEFAULTS);

  useEffect(() => {
    base44.entities.StoreSettings.list('-created_date', 1)
      .then(res => { if (res[0]) setS({ ...DEFAULTS, ...res[0] }); })
      .catch(() => {});
  }, []);

  const founders = [
    { name: s.about_founder1_name, role: s.about_founder1_role, desc: s.about_founder1_desc },
    { name: s.about_founder2_name, role: s.about_founder2_role, desc: s.about_founder2_desc },
  ].filter(f => f.name);

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">{s.about_hero_subtitle}</p>
          <h1 className="font-heading text-4xl sm:text-6xl mb-6">{s.about_hero_title}</h1>
          <div className="w-16 h-px bg-accent mx-auto" />
        </div>

        <motion.div {...fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="aspect-[4/3] bg-secondary overflow-hidden">
            {s.about_story_image ? (
              <img src={s.about_story_image} alt="Reva Designs" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent/20 to-secondary flex items-center justify-center">
                <span className="font-heading text-4xl text-muted-foreground/30">REVA</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="font-heading text-3xl mb-4">{s.about_story_heading}</h2>
            {s.about_story_text.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm font-body text-muted-foreground leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </motion.div>

        {founders.length > 0 && (
          <motion.div {...fadeIn} className="text-center mb-20">
            <h2 className="font-heading text-3xl mb-8">Our Founders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {founders.map(founder => (
                <div key={founder.name} className="text-center">
                  <div className="w-32 h-32 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <span className="font-heading text-2xl text-muted-foreground/40">{founder.name[0]}</span>
                  </div>
                  <h3 className="font-heading text-xl">{founder.name}</h3>
                  <p className="text-xs tracking-[0.15em] uppercase text-accent font-body mb-2">{founder.role}</p>
                  <p className="text-sm font-body text-muted-foreground">{founder.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Our Mission', text: s.about_mission },
            { title: 'Our Vision', text: s.about_vision },
            { title: 'Our Promise', text: s.about_promise },
          ].filter(i => i.text).map(item => (
            <div key={item.title} className="p-8 bg-secondary/50">
              <h3 className="font-heading text-xl mb-3">{item.title}</h3>
              <p className="text-sm font-body text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}