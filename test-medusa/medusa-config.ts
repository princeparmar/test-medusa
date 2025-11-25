import { defineConfig, loadEnv } from '@medusajs/framework/utils'

import { modulesConfig } from './medusa-configs/modules'
import { pluginsConfig } from './medusa-configs/plugins'
import { projectConfig } from './medusa-configs/project'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig,
  modules: modulesConfig,
  plugins: pluginsConfig,
})
