import type { DiscordSDK } from '@discord/embedded-app-sdk'
import { getDiscordClient } from 'playroomkit'

let discordSdk: DiscordSDK | undefined

export function initDiscordSdk() {
  if (!discordSdk) {
    discordSdk = getDiscordClient()
  }
  return discordSdk
}

export function getDiscordSdk() {
  return discordSdk
}
