import fs from 'fs-extra'
import path from 'node:path'
import type { ProjectConfig } from '../types/index.js'
import { logger } from '../ui/logger.js'

const DOCKER_FILES = [
  'Dockerfile',
  'Dockerfile.dev',
  'docker-compose.yml',
  'docker-compose.prod.yml',
  '.dockerignore',
  '.env.docker',
  '.env.docker.prod',
  'docker',
  'scripts/docker-start.sh',
]

const DOCKER_SCRIPTS = [
  'docker:dev',
  'docker:dev:tools',
  'docker:prod',
  'docker:stop',
  'docker:logs',
  'docker:shell',
  'docker:db:migrate',
  'docker:db:seed',
  'docker:db:reset',
  'docker:clean',
  'docker:status',
]

export async function handleDocker(targetDir: string, config: ProjectConfig): Promise<void> {
  if (config.docker) {
    // Docker is enabled, make sure files are executable
    await makeScriptsExecutable(targetDir)
  } else {
    // Docker is disabled, remove docker files and scripts
    await removeDockerFiles(targetDir)
    await removeDockerScripts(targetDir)
  }
}

async function makeScriptsExecutable(targetDir: string): Promise<void> {
  const scriptsDir = path.join(targetDir, 'scripts')

  if (!(await fs.pathExists(scriptsDir))) {
    return
  }

  try {
    const files = await fs.readdir(scriptsDir)
    for (const file of files) {
      if (file.endsWith('.sh')) {
        const filePath = path.join(scriptsDir, file)
        await fs.chmod(filePath, 0o755)
      }
    }
  } catch (error) {
    logger.debug(`Failed to make scripts executable: ${(error as Error).message}`)
  }
}

async function removeDockerFiles(targetDir: string): Promise<void> {
  for (const file of DOCKER_FILES) {
    const filePath = path.join(targetDir, file)
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath)
    }
  }
}

async function removeDockerScripts(targetDir: string): Promise<void> {
  const packageJsonPath = path.join(targetDir, 'package.json')

  if (!(await fs.pathExists(packageJsonPath))) {
    return
  }

  const packageJson = await fs.readJson(packageJsonPath)

  if (!packageJson.scripts) {
    return
  }

  for (const script of DOCKER_SCRIPTS) {
    delete packageJson.scripts[script]
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}
