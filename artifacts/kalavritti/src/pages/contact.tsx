import React, { useState } from "react";
import { useSubmitContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", subject: "general", message: ""
  });

  const submitContact = useSubmitContact({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message Sent", description: "Thank you for reaching out. We will get back to you shortly." });
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
    <div className="min-h-screen bg-white">

      {/* Banner */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "220px" }}>
        <img
          src="/assets/banner-contact.png"
          alt="Contact Us"
          className="w-full h-full object-cover absolute inset-0"
          style={{ minHeight: "220px", objectPosition: "right center" }}
        />
        <div className="absolute inset-0 bg-[#1a0800]/70 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0800] via-[#1a0800]/95 to-[#1a0800]/50 pointer-events-none"></div>

        <div className="relative z-10 container mx-auto px-6 md:px-10 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold/60"></div>
            <span className="text-gold/80 text-xs uppercase font-bold tracking-[0.3em]">Get in Touch</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold mb-2">Contact Us</h1>
          <div className="w-8 h-0.5 bg-gold mb-3"></div>
          <p className="font-serif text-lg md:text-xl font-semibold mb-1" style={{ color: "#D4860A" }}>
            We're Here to Help
          </p>
          <p className="text-white/70 text-sm md:text-base max-w-md">
            Have a question, suggestion, or just want to say hello?<br />We'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl border border-maroon/15 shadow-sm">
            <h2 className="font-serif text-2xl text-maroon-dark mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                    className="w-full bg-white border border-maroon/25 rounded-lg px-4 py-2.5 text-maroon-dark placeholder:text-maroon/30 focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full bg-white border border-maroon/25 rounded-lg px-4 py-2.5 text-maroon-dark placeholder:text-maroon/30 focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full bg-white border border-maroon/25 rounded-lg px-4 py-2.5 text-maroon-dark placeholder:text-maroon/30 focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Subject</label>
                  <select name="subject" value={formData.subject} onChange={handleChange}
                    className="w-full bg-white border border-maroon/25 rounded-lg px-4 py-2.5 text-maroon-dark focus:outline-none focus:ring-2 focus:ring-gold">
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Status</option>
                    <option value="return">Returns & Refunds</option>
                    <option value="artisan">Artisan Collaboration</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Message *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5}
                  className="w-full bg-white border border-maroon/25 rounded-lg px-4 py-2.5 text-maroon-dark placeholder:text-maroon/30 focus:outline-none focus:ring-2 focus:ring-gold resize-none"></textarea>
              </div>
              <Button type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-maroon-dark py-6 text-base rounded-lg mt-2 font-bold"
                disabled={submitContact.isPending}>
                {submitContact.isPending ? (
                  <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Sending...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane mr-2"></i>Send Message</>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              {[
                { icon: "fa-location-dot", color: "#C9A84C", title: "Our Store", text: "123 Heritage Lane,\nCraft District, New Delhi\nIndia 110001" },
                { icon: "fa-clock", color: "#D4860A", title: "Working Hours", text: "Monday – Saturday\n10:00 AM – 7:00 PM IST\nClosed on Sundays" },
                { icon: "fa-phone", color: "#1B6B7B", title: "Call Us", text: "+91 98765 43210\n+91 11 2345 6789" },
                { icon: "fa-envelope", color: "#2D6A4F", title: "Email", text: "namaste@kalavritti.in\nsupport@kalavritti.in" },
              ].map((item) => (
                <div key={item.title} className="bg-white p-5 rounded-xl border border-maroon/15 shadow-sm">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}22` }}>
                    <i className={`fa-solid ${item.icon} text-base`} style={{ color: item.color }}></i>
                  </div>
                  <h3 className="font-serif text-base text-maroon-dark mb-1.5">{item.title}</h3>
                  <p className="text-sm text-maroon/65 whitespace-pre-line">{item.text}</p>
                </div>
              ))}
            </div>

            <h3 className="font-serif text-xl text-maroon-dark mb-4">Quick Questions</h3>
            <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-maroon/15 shadow-sm px-6">
              <AccordionItem value="item-1" className="border-b border-maroon/15">
                <AccordionTrigger className="text-maroon-dark hover:text-maroon font-medium text-left">Do you ship internationally?</AccordionTrigger>
                <AccordionContent className="text-maroon/65 text-sm">Currently, we only ship within India. We are working on expanding our reach globally soon.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b border-maroon/15">
                <AccordionTrigger className="text-maroon-dark hover:text-maroon font-medium text-left">How do I track my order?</AccordionTrigger>
                <AccordionContent className="text-maroon/65 text-sm">Once your order is dispatched, you will receive an email with the tracking link and courier details.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-none">
                <AccordionTrigger className="text-maroon-dark hover:text-maroon font-medium text-left">Are the products really handmade?</AccordionTrigger>
                <AccordionContent className="text-maroon/65 text-sm">Yes, absolutely. We source all products directly from authentic artisans. Slight variations in color are natural and add to each piece's uniqueness.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
