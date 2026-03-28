import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Check, Star, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
const HomePage = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }, [location]);
  const tiers = [
    {
      name: 'Fan Club',
      price: '$30',
      period: '/mo',
      description: 'Perfect for enthusiasts starting their journey.',
      perks: [
        'Early looks at new content',
        'Behind-the-scenes access',
        'Members-only posts & updates',
        'Community access',
      ],
    },
    {
      name: 'VIP Lounge',
      price: '$45',
      period: '/mo',
      description: 'Elevate your experience with premium perks.',
      perks: [
        'All Fan Club perks',
        'Early access to new content',
        'Exclusive discounts',
        'Access with bigger drops',
        'VIP-only events',
      ],
      featured: true,
    },
    {
      name: 'Elite Lounge',
      price: '$55',
      period: '/mo',
      description: 'The ultimate all-access pass for true connoisseurs.',
      perks: [
        'All VIP Lounge perks',
        'Priority support',
        'Exclusive experience',
        'All access pass',
      ],
    },
  ];
  const testimonials = [
    {
      name: 'Eleanor Vance',
      role: 'VIP Member',
      quote:
        'Joining the VIP Lounge completely transformed my daily routine. The exclusive recipes and community support are unparalleled.',
      rating: 5,
    },
    {
      name: 'Marcus Chen',
      role: 'Elite Member',
      quote:
        'The Elite experience is exactly that—elite. Priority support and early access to drops make every penny worth it.',
      rating: 5,
    },
  ];
  const faqs = [
    {
      question: 'What is included in the membership?',
      answer:
        'Memberships include access to exclusive content, behind-the-scenes updates, community forums, and depending on your tier, special discounts and VIP events.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer:
        'Absolutely. You can change your membership tier at any time from your account dashboard. Changes take effect at the start of your next billing cycle.',
    },
    {
      question: 'Is there a commitment period?',
      answer:
        'No, all our memberships are billed monthly and you can cancel at any time without penalty.',
    },
  ];
  const fadeInUp = {
    initial: {
      opacity: 0,
      y: 20,
    },
    whileInView: {
      opacity: 1,
      y: 0,
    },
    viewport: {
      once: true,
      margin: '-100px',
    },
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  };
  return (
    <>
      <Helmet>
        <title>Apple Jucy | Luxury Memberships</title>
        <meta
          name="description"
          content="Join the exclusive Apple Jucy Members Portal for premium content, expert support, and a vibrant community."
        />
      </Helmet>

      <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
        <Header />

        {/* HERO SECTION */}
        <section
          id="home"
          className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1617213226302-99a82b62626f?q=80&w=2070&auto=format&fit=crop"
              alt="Luxury aesthetic background"
              className="w-full h-full object-cover opacity-[0.15] mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
          </div>

          <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 1,
                delay: 0.2,
              }}
              className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-widest uppercase mb-6"
            >
              The Exclusive Experience
            </motion.span>
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.3,
              }}
              className="text-5xl md:text-7xl font-light text-foreground tracking-tight mb-6 leading-tight"
            >
              Welcome to <br />
              <span className="font-medium">Apple Jucy Memberships</span>
            </motion.h1>
            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.5,
              }}
              className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto font-light"
            >
              Discover a world of refined taste, exclusive content, and a community that shares your
              passion for the extraordinary.
            </motion.p>
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.7,
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById('membership').scrollIntoView({
                    behavior: 'smooth',
                  })
                }
                className="rounded-full px-8 h-14 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Explore Memberships
              </Button>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 text-base border-border hover:bg-secondary w-full sm:w-auto"
                >
                  Member Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-24 md:py-32 px-6 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div {...fadeInUp} className="order-2 md:order-1">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5]">
                  <img
                    src="https://horizons-cdn.hostinger.com/c5220234-8448-43ff-be7f-d4df3f730b12/9-fMk9l.png"
                    alt="Elegant lifestyle"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                </div>
              </motion.div>
              <motion.div {...fadeInUp} className="order-1 md:order-2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                  A Standard of <span className="font-medium italic">Excellence</span>
                </h2>
                <div className="w-12 h-px bg-primary"></div>
                <p className="text-foreground/70 text-lg font-light leading-relaxed">
                  Apple Jucy isn't just a name; it's an experience curated for those who handle it!
                </p>
                <p className="text-foreground/70 text-lg font-light leading-relaxed">
                  My membership portal is designed to provide you with unparalleled access to my
                  most naughtiest behind-the-scenes, and a slew of naughty-shorts, png's, stickers
                  yes they are edibles too .
                </p>
                <div className="pt-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors group"
                  >
                    Discover tiers
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6">
          <div className="h-px w-full bg-border/50"></div>
        </div>

        {/* MEMBERSHIP TIERS SECTION */}
        <section id="membership" className="py-24 md:py-32 px-6 bg-background">
          <div className="container mx-auto max-w-6xl">
            <motion.div {...fadeInUp} className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4">
                Select Your <span className="font-medium">Experience</span>
              </h2>
              <p className="text-foreground/70 text-lg font-light">
                Choose the tier that perfectly aligns with your lifestyle and aspirations.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                >
                  <Card
                    className={`relative h-full flex flex-col transition-all duration-500 rounded-2xl border-border/50 ${tier.featured ? 'bg-card shadow-2xl scale-100 md:scale-105 z-10 border-primary/20' : 'bg-card/50 shadow-lg hover:shadow-xl hover:-translate-y-1'}`}
                  >
                    {tier.featured && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="bg-primary text-primary-foreground text-xs font-medium tracking-widest uppercase py-1.5 px-4 rounded-full shadow-md">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <CardHeader className="text-center pt-10 pb-6">
                      <CardTitle className="text-xl font-medium text-foreground mb-2">
                        {tier.name}
                      </CardTitle>
                      <div className="flex items-baseline justify-center text-foreground">
                        <span className="text-4xl font-light tracking-tight">{tier.price}</span>
                        <span className="text-foreground/60 ml-1">{tier.period}</span>
                      </div>
                      <p className="text-sm text-foreground/60 mt-4 font-light">
                        {tier.description}
                      </p>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col px-8 pb-10">
                      <ul className="space-y-4 mb-8 flex-grow">
                        {tier.perks.map((perk, i) => (
                          <li
                            key={i}
                            className="flex items-start text-sm text-foreground/80 font-light"
                          >
                            <Check className="w-4 h-4 text-primary mr-3 shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>

                      <Link to="/upgrade" className="block mt-auto">
                        <Button
                          className={`w-full rounded-full h-12 ${tier.featured ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'}`}
                        >
                          Choose Plan
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-24 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-5xl">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-light tracking-tight text-foreground mb-4">
                Words from our <span className="font-medium">Members</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.2,
                  }}
                >
                  <Card className="bg-card border-none shadow-md rounded-2xl p-8 h-full">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground/80 text-lg font-light italic mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-4">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{testimonial.name}</h4>
                        <p className="text-xs text-foreground/60">{testimonial.role}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-24 md:py-32 px-6 bg-background">
          <div className="container mx-auto max-w-3xl">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-light tracking-tight text-foreground mb-4">
                Common <span className="font-medium">Inquiries</span>
              </h2>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-border/50 py-2"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline text-lg">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/70 font-light leading-relaxed text-base pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contact" className="bg-foreground text-background py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <span className="text-2xl font-bold tracking-tight mb-4 block">Apple Jucy</span>
                <p className="text-background/60 font-light max-w-sm leading-relaxed">
                  Elevating the standard of wellness through curated experiences, premium products,
                  and an exclusive community.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-4 tracking-wide">Navigation</h4>
                <ul className="space-y-3 text-background/60 font-light text-sm">
                  <li>
                    <a href="#home" className="hover:text-white transition-colors">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#membership" className="hover:text-white transition-colors">
                      Memberships
                    </a>
                  </li>
                  <li>
                    <Link to="/products" className="hover:text-white transition-colors">
                      Shop
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-4 tracking-wide">Contact</h4>
                <ul className="space-y-3 text-background/60 font-light text-sm">
                  <li>
                    <a
                      href="mailto:support@applejucy.com"
                      className="hover:text-white transition-colors"
                    >
                      support@applejucy.com
                    </a>
                  </li>
                  <li>New York, NY</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-background/40 font-light">
              <p>© {new Date().getFullYear()} Apple Jucy. All rights reserved.</p>
              <div className="flex space-x-6">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};
export default HomePage;
