<div class="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-6 text-center">
  <div class="max-w-2xl">
    <div class="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mb-8 mx-auto border border-amber-200 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    </div>
    <h1 class="text-5xl font-extrabold text-[#1c140a] mb-6 tracking-tight">Telegram Support Chatbot</h1>
    <p class="text-xl text-[#7a6a52] leading-relaxed mb-10 font-medium">
      A premium, real-time customer support chatbot integrated with Telegram.
      Migrated and updated for the CodeNx design system.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white p-6 rounded-2xl border border-[#e5d9c8] shadow-sm">
        <h3 class="font-bold text-[#1c140a] mb-2">Real-time</h3>
        <p class="text-sm text-[#7a6a52]">Instant polling and webhook support for lightning fast replies.</p>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-[#e5d9c8] shadow-sm">
        <h3 class="font-bold text-[#1c140a] mb-2">Telegram Sync</h3>
        <p class="text-sm text-[#7a6a52]">Directly talk to your customers from your Telegram app.</p>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-[#e5d9c8] shadow-sm">
        <h3 class="font-bold text-[#1c140a] mb-2">Karla Design</h3>
        <p class="text-sm text-[#7a6a52]">Sleek, professional UI matching the premium gold aesthetic.</p>
      </div>
    </div>

    <button 
      class="bg-gradient-to-br from-amber-500 to-amber-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-amber-200 hover:scale-105 transition-transform active:scale-95"
      onclick={() => {
        import('$lib/store').then(m => m.chatState.update(s => ({ ...s, isOpen: true })))
      }}
    >
      Test Chat Widget
    </button>
  </div>

  <div class="mt-20 text-[#b8a88a] text-xs font-black uppercase tracking-[0.25em]">
    Powered by CodeNx & Telegram
  </div>
</div>
