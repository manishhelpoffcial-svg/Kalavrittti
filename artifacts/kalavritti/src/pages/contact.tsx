import React, { useState } from "react";
import { useSubmitContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "general",
    message: ""
  });

  const submitContact = useSubmitContact({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Message Sent",
          description: "Thank you for reaching out. We will get back to you shortly."
        });
        setFormData({ fullName: "", email: "", phone: "", subject: "general", message: "" });
      }
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate({ data: formData });
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-maroon-dark py-16 px-4 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Contact Us</h1>
        <p className="text-cream/80 max-w-2xl mx-auto">
          Have a question about a product, your order, or just want to say namaste? We'd love to hear from you.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gold/20">
            <h2 className="font-serif text-2xl text-maroon-dark mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-maroon-dark mb-1.5">Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required 
                    className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-maroon-dark mb-1.5">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-maroon-dark mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-maroon-dark mb-1.5">Subject</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Status</option>
                    <option value="return">Returns & Refunds</option>
                    <option value="artisan">Artisan Collaboration</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-maroon-dark mb-1.5">Message *</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required 
                  rows={5}
                  className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                ></textarea>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-maroon hover:bg-maroon-light text-white py-6 text-base rounded-lg mt-4 shadow-md"
                disabled={submitContact.isPending}
              >
                {submitContact.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Info & FAQ */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <div className="bg-cream-dark p-6 rounded-xl border border-gold/10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 text-maroon">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-maroon-dark mb-2">Our Store</h3>
                <p className="text-sm text-muted-foreground">123 Heritage Lane,<br/>Craft District, New Delhi<br/>India 110001</p>
              </div>
              
              <div className="bg-cream-dark p-6 rounded-xl border border-gold/10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 text-maroon">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-maroon-dark mb-2">Working Hours</h3>
                <p className="text-sm text-muted-foreground">Monday - Saturday<br/>10:00 AM - 7:00 PM IST<br/>Closed on Sundays</p>
              </div>

              <div className="bg-cream-dark p-6 rounded-xl border border-gold/10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 text-maroon">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-maroon-dark mb-2">Call Us</h3>
                <p className="text-sm text-muted-foreground">+91 98765 43210<br/>+91 11 2345 6789</p>
              </div>

              <div className="bg-cream-dark p-6 rounded-xl border border-gold/10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 text-maroon">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-maroon-dark mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">namaste@kalavritti.in<br/>support@kalavritti.in</p>
              </div>
            </div>

            {/* Quick FAQ */}
            <h3 className="font-serif text-2xl text-maroon-dark mb-6">Quick Questions</h3>
            <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-gold/20 px-6">
              <AccordionItem value="item-1" className="border-b border-border">
                <AccordionTrigger className="text-maroon-dark hover:text-maroon font-medium text-left">Do you ship internationally?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Currently, we only ship within India. We are working on expanding our reach globally soon.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b border-border">
                <AccordionTrigger className="text-maroon-dark hover:text-maroon font-medium text-left">How do I track my order?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Once your order is dispatched, you will receive an email with the tracking link and courier details.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-none">
                <AccordionTrigger className="text-maroon-dark hover:text-maroon font-medium text-left">Are the products really handmade?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Yes, absolutely. We source all our products directly from authentic artisans across India. Since they are handmade, slight variations in color and design are natural and add to the uniqueness of each piece.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}