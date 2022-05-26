import { FastifyInstance } from 'fastify'
import { FastifyModule, _require, _requireEntryFile, _requireFastify } from './require'

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
  prefix: string
  entry: string
  require: string[]
  port: number
  address: string
  debug: boolean
  debugPort: number
  debugAddress: string
  pretty: boolean
}

/**
 * Start fastify instance
 * @param {object} options options
 * @returns
 */
export async function start (options: StartOption): Promise<FastifyInstance> {
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

  // we update fastify reference
  cacheFastify(options.entry)

  let entryPlugin = null
  const fastifyOptions: any = { logger: { level: 'fatal' } }

  try {
    const plugin = await _requireEntryFile(options.entry)
    entryPlugin = plugin.plugin
    Object.assign(fastifyOptions, plugin.options)
  } catch (error: any) {
    stop(error)
  }

  if (options.pretty) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PinoPretty = require('pino-pretty')
    fastifyOptions.logger.stream = PinoPretty({
      colorize: true,
      sync: true
    })
  }

  // debug
  if (options.debug) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const inspector = require('inspector')
    inspector.open(options.debugPort, options.debugAddress)
  }

  const fastify = Fastify(fastifyOptions)

  await fastify.register(entryPlugin, { prefix: options.prefix })

  await fastify.listen({ port: options.port, host: options.address })

  return fastify as any
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
