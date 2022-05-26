import { FastifyInstance } from 'fastify'
import { FastifyModule, _require, _requireEntryFile, _requireFastify } from './import'

// @ts-expect-error
let Fastify: FastifyModule = null

/**
 * Cache fastify module to global
 * It is useful when `watch` is enabled
 * @param {string} entry entry file
 */
function cacheFastify (entry: string): void {
  try {
    Fastify = _requireFastify(entry)
  } catch (error: any) {
    stop(error)
  }
}

export interface StartOption {
  entry: string
  require: string[]
  port: number
  address: string
}

/**
 * Start fastify instance
 * @param {object} options options
 * @returns
 */
export async function start (options: StartOption): Promise<FastifyInstance> {
  console.log(options)

  // we require the files before any actions
  try {
    for (const file of options.require) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (file) {
        /**
           * This check ensures we ignore `-r ""`, trailing `-r`, or
           * other silly things the user might (inadvertently) be doing.
           */
        _require(file)
      }
    }
  } catch (error: any) {
    stop(error)
  }

  cacheFastify(options.entry)

  let entryPlugin = null

  try {
    entryPlugin = await _requireEntryFile(options.entry)
  } catch (error: any) {
    stop(error)
  }

  const fastify = Fastify({ logger: true })

  await fastify.register(entryPlugin)

  await fastify.listen(options.port)

  return await fastify
}

/**
 * Stop the process
 * @param {object|string} message error or message
 * @returns
 */
export function stop (message?: Error | string): void {
  if (message instanceof Error) {
    console.log(message)
    return process.exit(1)
  } else if (message !== undefined) {
    console.log(`Warn: ${message}`)
    return process.exit(1)
  }
  process.exit()
}
