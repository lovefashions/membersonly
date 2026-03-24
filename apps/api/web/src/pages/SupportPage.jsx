import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Mail, MessageCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';

const SupportPage = () => {
  const faqs = [
    {
      question: 'What are the different membership tiers?',
      answer: 'We offer three membership tiers: Fan Club ($30/mo) with access to basic content and community, VIP Lounge ($45/mo) which includes all Fan perks plus exclusive discounts and VIP events, and Elite Lounge ($55/mo) with all VIP perks plus priority support and exclusive experiences.',
    },
    {
      question: 'How do I upgrade my membership?',
      answer: (
        <>
          You can upgrade your membership anytime by visiting the <Link to="/upgrade" className="text-primary hover:underline font-medium">Upgrade page</Link> from your dashboard. Simply select your desired tier and complete the payment through our secure checkout. Your account will be upgraded immediately.
        </>
      ),
    },
    {
      question: 'Can I cancel my membership?',
      answer: 'Yes, you can cancel your membership at any time. Simply contact our support team at support@applejucy.com and we will process your cancellation. You will retain access to your current tier until the end of your billing period.',
    },
    {
      question: 'How does billing work?',
      answer: 'All memberships are billed monthly through our secure payment processor. You will receive an email receipt for each payment. Your membership will automatically renew each month unless you cancel.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards and PayPal through our secure checkout. All transactions are secure and encrypted.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee for new members. If you are not satisfied with your membership within the first 7 days, contact support@applejucy.com for a full refund.',
    },
    {
      question: 'How do I access exclusive content?',
      answer: 'Once you upgrade to VIP or Elite tier, exclusive content will be available in your dashboard. You will also receive notifications when new content is added to the collection.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Support & Concierge | Apple Jucy</title>
        <meta name="description" content="Get assistance with your Apple Jucy membership. Browse FAQs or contact our concierge team." />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <Header />

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4">Concierge & Support</h1>
              <p className="text-lg text-foreground/70 font-light max-w-2xl mx-auto">
                We are dedicated to ensuring your experience is flawless. Find answers below or reach out to our team.
              </p>
            </div>

            {/* FAQ Section */}
            <Card className="bg-card border-border/50 shadow-md rounded-2xl mb-8 overflow-hidden">
              <CardHeader className="bg-secondary/20 border-b border-border/30 pb-4">
                <CardTitle className="text-xl font-medium flex items-center text-foreground">
                  <MessageCircle className="w-5 h-5 mr-3 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                      <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline text-base">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground/70 font-light leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="bg-card border-border/50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-secondary/20 border-b border-border/30 pb-4">
                <CardTitle className="text-xl font-medium flex items-center text-foreground">
                  <Mail className="w-5 h-5 mr-3 text-primary" />
                  Direct Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <p className="text-foreground/70 font-light">
                    Require personalized assistance? Our concierge team is at your service.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-secondary/30 p-6 rounded-xl border border-border/50">
                      <h3 className="font-medium text-foreground mb-2">Email Concierge</h3>
                      <p className="text-foreground/60 font-light text-sm mb-4">
                        We aim to respond to all inquiries within 24 hours. Elite members receive priority routing.
                      </p>
                      <a
                        href="mailto:support@applejucy.com"
                        className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>support@applejucy.com</span>
                      </a>
                    </div>

                    <div className="bg-background p-6 rounded-xl border border-border/50">
                      <h3 className="font-medium text-foreground mb-2">Operating Hours</h3>
                      <div className="text-foreground/60 font-light text-sm space-y-2">
                        <p className="flex justify-between">
                          <span>Monday - Friday</span>
                          <span>9:00 AM - 6:00 PM EST</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Saturday - Sunday</span>
                          <span>10:00 AM - 4:00 PM EST</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;