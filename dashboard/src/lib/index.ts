import { PUBLIC_API_ENDPOINT } from '$env/static/public';

export function formatScriptText(projectId: string) {
	return `
  <script defer src="${PUBLIC_API_ENDPOINT}/script"></script>
  <script>
    window.TELEGRAM_CHATBOT_ENDPOINT = "${PUBLIC_API_ENDPOINT}"
    window.TELEGRAM_CHATBOT_KEY = "${projectId}"
  </script>`;
}
