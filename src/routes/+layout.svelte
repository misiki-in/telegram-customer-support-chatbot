<script lang="ts">
  import "../app.css";
  import { onNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import TelegramChat from "$lib/components/chatbot/telegram-chat.svelte";

  let { children } = $props();

  // Simple View Transitions API support
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

{#key page.url.pathname}
  <div in:fade={{ duration: 300, delay: 150 }} out:fade={{ duration: 150 }}>
    {@render children()}
  </div>
{/key}

<TelegramChat />

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
