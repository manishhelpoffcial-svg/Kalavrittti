import React from "react";
import { useRoute, Link } from "wouter";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductCard } from "@/components/shared/ProductCard";
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { useGetBlogPostBySlug, useGetRelatedProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  
  const { data: post, isLoading } = useGetBlogPostBySlug(slug, { 
    query: { enabled: !!slug } as any
  });

  // Use a hardcoded product ID for related products since we don't have one linked to the blog directly
  const { data: relatedProducts } = useGetRelatedProducts(1, {
    query: { enabled: !!post } as any
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">The story you're looking for doesn't exist or has been moved.</p>
        <Link href="/blog" className="text-maroon font-medium hover:underline">Return to Journal</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Article Header */}
      <div className="container mx-auto px-4 pt-16 pb-8 max-w-4xl text-center">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-maroon hover:text-maroon-dark mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>
        
        {post.categoryTag && (
          <div className="text-gold font-bold uppercase tracking-widest text-xs mb-4">
            {post.categoryTag}
          </div>
        )}
        
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-maroon-dark mb-6 leading-tight">
          {post.title}
        </h1>
        
        {post.excerpt && (
          <p className="text-xl text-muted-foreground font-light mb-8 max-w-2xl mx-auto">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground border-y border-gold/20 py-4 mb-8">
          {post.authorName && (
            <div className="flex items-center gap-2">
              {post.authorPhoto ? (
                <img src={post.authorPhoto} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
                  <User className="w-4 h-4 text-maroon" />
                </div>
              )}
              <span className="font-medium text-maroon-dark">{post.authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {post.publishedAt}
          </div>
          {post.readTime && (
            <div>{post.readTime} min read</div>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="container mx-auto px-4 max-w-5xl mb-16">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-gold/10 shadow-sm bg-cream-dark">
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container mx-auto px-4 max-w-3xl mb-16">
        <div className="prose prose-maroon prose-lg max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
        
        {/* Share */}
        <div className="mt-16 pt-8 border-t border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-serif text-maroon-dark text-lg">Share this story:</span>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-maroon hover:bg-maroon hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-maroon hover:bg-maroon hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-maroon hover:bg-maroon hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-maroon hover:bg-maroon hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 max-w-6xl mt-24">
          <SectionHeading title="Featured in this Story" className="mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}