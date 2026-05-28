import React from "react";
import { Link } from "wouter";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ArrowRight, Calendar, User } from "lucide-react";
import img1 from "@assets/7ee1b186-afe4-447e-b2c6-7d511d68c301_1779952388561.jpeg";
import img2 from "@assets/62e47a96-fd95-43ed-9c44-8552b7e1fbd0_1779952388572.jpeg";
import img3 from "@assets/f87d606e-dd69-4688-810b-72d894629b98_1779952388584.jpeg";

export default function Blog() {
  // Placeholder data since we don't have a real blog API hooked up for the main list
  const blogPosts = [
    {
      id: 1,
      slug: "art-of-terracotta",
      title: "The Ancient Art of Terracotta Pottery",
      excerpt: "Discover the history and process behind India's oldest craft form. From the clay banks of Bengal to the markets of the world.",
      category: "Craft History",
      image: img1,
      date: "Oct 12, 2023",
      author: "Priya Sharma"
    },
    {
      id: 2,
      slug: "wedding-kulo-significance",
      title: "Significance of the Hand-painted Kulo in Indian Weddings",
      excerpt: "The beautifully decorated bamboo winnowing fan holds a special place in Bengali weddings. Learn about its cultural importance.",
      category: "Traditions",
      image: img2,
      date: "Sep 28, 2023",
      author: "Aditi Gupta"
    },
    {
      id: 3,
      slug: "sustainable-festivals",
      title: "Celebrating Sustainable Festivals with Handmade Decor",
      excerpt: "How to reduce your carbon footprint this festive season by opting for traditional, eco-friendly handmade decorations.",
      category: "Sustainability",
      image: img3,
      date: "Aug 15, 2023",
      author: "Rohan Das"
    }
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-maroon-dark py-20 px-4 text-center border-b-4 border-gold">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">The Artisan Journal</h1>
        <p className="text-cream/80 max-w-2xl mx-auto">
          Stories, traditions, and the cultural history behind India's rich handcrafted heritage.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <span className="px-4 py-2 rounded-full bg-maroon text-white text-sm font-medium cursor-pointer">All Posts</span>
          <span className="px-4 py-2 rounded-full bg-white border border-border text-muted-foreground text-sm font-medium cursor-pointer hover:border-maroon hover:text-maroon">Craft History</span>
          <span className="px-4 py-2 rounded-full bg-white border border-border text-muted-foreground text-sm font-medium cursor-pointer hover:border-maroon hover:text-maroon">Traditions</span>
          <span className="px-4 py-2 rounded-full bg-white border border-border text-muted-foreground text-sm font-medium cursor-pointer hover:border-maroon hover:text-maroon">Sustainability</span>
          <span className="px-4 py-2 rounded-full bg-white border border-border text-muted-foreground text-sm font-medium cursor-pointer hover:border-maroon hover:text-maroon">Artisan Interviews</span>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Link href={`/blog/${blogPosts[0].slug}`} className="group flex flex-col lg:flex-row bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/20 hover:shadow-md transition-all">
            <div className="lg:w-1/2 aspect-video lg:aspect-auto overflow-hidden relative">
              <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-4 left-4 bg-gold text-maroon-dark text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded">
                Featured
              </div>
            </div>
            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-4">
                <span className="text-maroon uppercase tracking-wider">{blogPosts[0].category}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {blogPosts[0].date}</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark mb-4 group-hover:text-maroon transition-colors leading-tight">
                {blogPosts[0].title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                {blogPosts[0].excerpt}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-maroon-dark">
                  <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
                    <User className="w-4 h-4 text-maroon" />
                  </div>
                  {blogPosts[0].author}
                </div>
                <span className="flex items-center gap-2 text-maroon font-medium group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Post Grid */}
        <SectionHeading title="Latest Articles" className="mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-maroon-dark text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                  {post.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                </div>
                <h3 className="font-serif text-xl text-maroon-dark mb-3 group-hover:text-maroon transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs font-medium text-maroon-dark flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {post.author}
                  </span>
                  <span className="text-maroon text-sm font-medium">Read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}