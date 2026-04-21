import type { NextConfig } from 'next'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '../../.env' })

const nextConfig: NextConfig = {
  output: 'standalone',
}

export default nextConfig
