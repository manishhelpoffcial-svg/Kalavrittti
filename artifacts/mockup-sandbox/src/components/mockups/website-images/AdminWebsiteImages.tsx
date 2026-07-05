import { useState, useRef } from "react";

const DOMAIN = "ca2e70df-6317-4eee-a87f-715be304688d-00-1041yk2oxpbbg.pike.replit.dev";
const ASSET = (f: string) => `https://${DOMAIN}/assets/${f}`;

const MOCK_IMAGES = [
  { id: 1, key: "hero_homepage", label: "Homepage Hero Image", section: "homepage", url: ASSET("hero-crown.png"), description: "Main hero banner on the homepage", altText: "Handcrafted artisan crown", sortOrder: 1 },
  { id: 2, key: "banner_categories", label: "Categories Page Banner", section: "banners", url: ASSET("banner-categories.png"), description: "Banner at top of Shop by Category section", altText: null, sortOrder: 2 },
  { id: 3, key: "banner_promo", label: "Promotional Banner Background", section: "banners", url: ASSET("banner-promo.jpg"), description: "Background for the festive sale promo banner", altText: null, sortOrder: 3 },
  { id: 4, key: "banner_artisans", label: "Artisans Page Banner", section: "banners", url: ASSET("banner-artisans.png"), description: "Banner for the artisans directory page", altText: null, sortOrder: 4 },
  { id: 5, key: "banner_contact", label: "Contact Page Banner", section: "banners", url: ASSET("banner-contact.png"), description: "Banner on the contact us page", altText: null, sortOrder: 5 },
  { id: 6, key: "banner_weaving", label: "Weaving Decorative Banner", section: "banners", url: ASSET("banner-weaving.jpg"), description: "Decorative weaving banner", altText: null, sortOrder: 6 },
  { id: 7, key: "banner_ourstory_delivery", label: "Our Story - Delivery Image", section: "our_story", url: ASSET("banner-ourstory-delivery.jpg"), description: "Delivery illustration on the Our Story page", altText: null, sortOrder: 7 },
  { id: 8, key: "banner_ourstory_weaving", label: "Our Story - Weaving Image", section: "our_story", url: ASSET("banner-ourstory-weaving.jpg"), description: "Weaving illustration on the Our Story page", altText: null, sortOrder: 8 },
  { id: 9, key: "cat_jewelry", label: "Category Card - Jewelry", section: "categories", url: ASSET("cat-jewelry.jpeg"), description: "Fallback image for the Jewelry category card", altText: null, sortOrder: 9 },
  { id: 10, key: "cat_lacquerware", label: "Category Card - Lacquerware", section: "categories", url: ASSET("cat-lacquerware.jpeg"), description: "Fallback image for Lacquerware category card", altText: null, sortOrder: 10 },
  { id: 11, key: "cat_pottery", label: "Category Card - Pottery", section: "categories", url: ASSET("cat-pottery.jpeg"), description: "Fallback image for the Pottery category card", altText: null, sortOrder: 11 },
  { id: 12, key: "cat_textiles", label: "Category Card - Textiles", section: "categories", url: ASSET("cat-textiles.jpeg"), description: "Fallback image for the Textiles category card", altText: null, sortOrder: 12 },
  { id: 13, key: "cat_woodcraft", label: "Category Card - Woodcraft", section: "categories", url: ASSET("cat-woodcraft.jpeg"), description: "Fallback image for the Woodcraft category card", altText: null, sortOrder: 13 },
];

const SECTIONS = [
  { value: "all", label: "All Images" },
  { value: "homepage", label: "Homepage" },
  { value: "banners", label: "Banners" },
  { value: "categories", label: "Categories" },
  { value: "our_story", label: "Our Story" },
];

const SECTION_COLORS: Record<string, string> = {
  homepage: "bg-blue-100 text-blue-700",
  banners: "bg-purple-100 text-purple-700",
  categories: "bg-amber-100 text-amber-700",
  our_story: "bg-green-100 text-green-700",
  general: "bg-gray-100 text-gray-700",
};

const sectionLabel = (s: string) => SECTIONS.find(ss => ss.value === s)?.label ?? s;

type Img = typeof MOCK_IMAGES[number];

export default function AdminWebsiteImages() {
  const [activeSection, setActiveSection] = useState("all");
  const [search, setSearch] = useState("");
  const [editImg, setEditImg] = useState<Img | null>(null);
  const [replaceImg, setReplaceImg] = useState<Img | null>(null);
  const [replaceMode, setReplaceMode] = useState<"upload" | "url">("upload");
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filtered = MOCK_IMAGES.filter(img => {
    const matchSection = activeSection === "all" || img.section === activeSection;
    const matchSearch = !search || img.label.toLowerCase().includes(search.toLowerCase()) || img.key.includes(search.toLowerCase());
    return matchSection && matchSearch;
  });

  const grouped = SECTIONS.filter(s => s.value !== "all").reduce<Record<string, Img[]>>((acc, s) => {
    acc[s.value] = filtered.filter(i => i.section === s.value);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="flex h-screen">
        <aside className="w-56 bg-[#1a1a1a] flex flex-col shrink-0">
          <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7c2d12] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Kalavritti</p>
              <p className="text-gray-500 text-[10px]">Super Admin</p>
            </div>
          </div>
          <nav className="flex-1 py-2 overflow-y-auto">
            {[
              { group: "Main", items: [{ label: "Dashboard", active: false }] },
              { group: "Catalog", items: [{ label: "Products", active: false }, { label: "Categories", active: false }, { label: "Artisans", active: false }] },
              { group: "Operations", items: [{ label: "Orders", active: false }, { label: "Financials", active: false }] },
              { group: "Configuration", items: [
                { label: "Website Images", active: true },
                { label: "SEO Settings", active: false },
                { label: "Website Settings", active: false },
              ]},
            ].map(({ group, items }) => (
              <div key={group} className="mb-1">
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{group}</p>
                {items.map(item => (
                  <div key={item.label} className={`mx-2 px-3 py-2 rounded-md text-sm flex items-center gap-2 cursor-pointer ${item.active ? "bg-[#7c2d12] text-white font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                    <div className="w-4 h-4 rounded bg-current opacity-40 shrink-0" />
                    {item.label}
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Topbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-gray-400">Admin</span>
              <span>/</span>
              <span className="font-medium text-gray-800">Website Images</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#7c2d12]/20 flex items-center justify-center text-xs font-bold text-[#7c2d12]">A</div>
          </div>

          <div className="p-6 space-y-5 max-w-7xl">
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Website Images</h1>
                <p className="text-sm text-gray-400 mt-0.5">Manage all static images used across the website — {MOCK_IMAGES.length} images</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Refresh
                </button>
                <button onClick={() => showToast("Add Image dialog would open here")} className="flex items-center gap-1.5 bg-[#7c2d12] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#9a3412] transition-colors font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Image
                </button>
              </div>
            </div>

            {/* Section filter pills */}
            <div className="flex gap-2 flex-wrap">
              {SECTIONS.map(s => {
                const cnt = s.value === "all" ? MOCK_IMAGES.length : MOCK_IMAGES.filter(i => i.section === s.value).length;
                return (
                  <button
                    key={s.value}
                    onClick={() => setActiveSection(s.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeSection === s.value ? "bg-[#7c2d12] text-white border-[#7c2d12]" : "bg-white text-gray-600 border-gray-200 hover:border-[#7c2d12]/40"}`}
                  >
                    {s.label} <span className="ml-1 opacity-60">{cnt}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by label or key…"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c2d12]/20 focus:border-[#7c2d12]/40 bg-white"
              />
            </div>

            {/* Image grid grouped by section */}
            {(activeSection === "all" ? Object.entries(grouped) : [[activeSection, filtered] as [string, Img[]]]).map(([sec, imgs]) => {
              if (!imgs.length) return null;
              return (
                <div key={sec}>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    {sectionLabel(sec)}
                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-normal">{imgs.length}</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {imgs.map(img => (
                      <div key={img.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#7c2d12]/30 hover:shadow-md transition-all cursor-pointer">
                        {/* Image */}
                        <div className="relative aspect-video bg-gray-50 overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.altText || img.label}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <button onClick={() => setReplaceImg(img)} className="bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Replace
                            </button>
                            <button onClick={() => setEditImg(img)} className="bg-white text-gray-800 hover:bg-amber-50 hover:text-amber-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Edit
                            </button>
                            <button onClick={() => showToast(`Removed "${img.label}"`)} className="bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 p-1.5 rounded-lg transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-3 space-y-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-1">{img.label}</p>
                            <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${SECTION_COLORS[img.section] ?? "bg-gray-100 text-gray-600"}`}>
                              {sectionLabel(img.section)}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono truncate">{img.key}</p>
                          {img.description && <p className="text-[10px] text-gray-500 line-clamp-1">{img.description}</p>}
                          <div className="flex gap-1 pt-1">
                            <button onClick={() => setReplaceImg(img)} className="flex-1 flex items-center justify-center gap-1 border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-500 py-1 rounded-md text-[10px] font-medium transition-colors">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Replace
                            </button>
                            <button onClick={() => setEditImg(img)} className="flex-1 flex items-center justify-center gap-1 border border-gray-200 hover:border-amber-300 hover:text-amber-600 text-gray-500 py-1 rounded-md text-[10px] font-medium transition-colors">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Edit
                            </button>
                            <button onClick={() => showToast(`Removed "${img.label}"`)} className="px-2 border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-300 py-1 rounded-md transition-colors">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      {editImg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditImg(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Edit Image Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Label</label>
                  <input defaultValue={editImg.label} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c2d12]/20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Key <span className="text-gray-300">(locked)</span></label>
                  <input value={editImg.key} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Image URL</label>
                <input defaultValue={editImg.url} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c2d12]/20" />
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                <img src={editImg.url} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea defaultValue={editImg.description ?? ""} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7c2d12]/20" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setEditImg(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { showToast("Changes saved"); setEditImg(null); }} className="px-4 py-2 bg-[#7c2d12] text-white rounded-lg text-sm font-medium hover:bg-[#9a3412]">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Dialog */}
      {replaceImg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReplaceImg(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Replace — {replaceImg.label}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Current image:</p>
                <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                  <img src={replaceImg.url} alt="current" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setReplaceMode("upload")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${replaceMode === "upload" ? "bg-[#7c2d12] text-white border-[#7c2d12]" : "bg-white text-gray-600 border-gray-200"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Upload File
                </button>
                <button onClick={() => setReplaceMode("url")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${replaceMode === "url" ? "bg-[#7c2d12] text-white border-[#7c2d12]" : "bg-white text-gray-600 border-gray-200"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> Paste URL
                </button>
              </div>
              {replaceMode === "upload" ? (
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => { showToast("Image uploaded to Cloudinary!"); setReplaceImg(null); }} />
                  <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 hover:border-[#7c2d12]/50 rounded-xl p-8 text-center transition-colors group">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 group-hover:text-[#7c2d12]/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <p className="text-sm font-medium text-gray-600">Click to select image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </button>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">New Image URL</label>
                  <input placeholder="https://res.cloudinary.com/... or /assets/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c2d12]/20" />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setReplaceImg(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              {replaceMode === "url" && <button onClick={() => { showToast("URL updated!"); setReplaceImg(null); }} className="px-4 py-2 bg-[#7c2d12] text-white rounded-lg text-sm font-medium hover:bg-[#9a3412]">Update URL</button>}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm z-[999] flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
