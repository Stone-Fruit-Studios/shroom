import { DiscordSDK } from '@discord/embedded-app-sdk'

let discordSdk: DiscordSDK | null = null

export async function initDiscord() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID
  if (!clientId) {
    console.warn('VITE_DISCORD_CLIENT_ID not set — skipping Discord init')
    return null
  }

  discordSdk = new DiscordSDK(clientId)
  await discordSdk.ready()
  return discordSdk
}

export function getDiscordSdk() {
  return discordSdk
}
