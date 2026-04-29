import { browser } from "$app/environment";
import { GET } from "$lib/fetch";
import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch }) => {
  if (browser) {
    const user = await GET(fetch, `/api/auth/me`)
    if (!user)
      redirect(307, '/login')
    return {
      user
    }
  }

  return {
    user: null
  }
}
