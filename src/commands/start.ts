import { Flags } from '@oclif/core'
import { constants } from 'fs'
import { access } from 'fs/promises'
import { resolve } from 'path'
import { Command } from '../utils/command/command'
import { _import } from '../utils/import'
import { start, StartOption } from '../utils/start'

export default class Start extends Command {
  static description = 'Start fastify instance'

  static args = [
    { name: 'entry', required: true, description: 'Entry point of fastify instance.' }
  ]

  static flags = {
    require: Flags.string({ char: 'r', description: 'Preload Modules, for example "-r ts-node/register".', multiple: true }),
    port: Flags.integer({ char: 'p', description: 'Port listen on.', default: 3000 }),
    address: Flags.string({ char: 'a', description: 'Address listen on. It can be either address or socket.', default: 'localhost' }),
    debug: Flags.boolean({ char: 'd', description: '[default: false] Enable debug mode.' }),
    'debug-port': Flags.integer({ description: '[default: 9320] Inspector port.', dependsOn: ['debug'] }),
    'debug-address': Flags.string({ description: 'Inspector host, by default it will be either "localhost" or "0.0.0.0" in docker.', dependsOn: ['debug'] }),
    prefix: Flags.string({ description: '[default: ""] Entry file prefix.' }),
    pretty: Flags.boolean({ char: 'P', description: '[default: false] Use "pino-pretty" for log display. It require to install the module seperately.' }),
    help: Flags.help()
  }

  async run (): Promise<void> {
    const { args, flags } = await this.parse(Start)
    console.log(args, flags)

    // we normalize the options before start
    const options: Partial<StartOption> = {}
    options.prefix = await this.normalizeEntry(args.entry as string)
    options.entry = await this.normalizeEntry(args.entry as string)
    options.require = await this.normalizeRequire(flags.require)
    options.port = await this.normalizePort(flags.port)
    options.address = await this.normalizeAddress(flags.address)
    options.debug = await this.normalizeDebug(flags.debug)
    options.debugPort = await this.normalizeDebugPort(flags['debug-port'])
    options.debugAddress = await this.normalizeDebugAddress(flags['debug-address'])
    options.pretty = await this.normalizePretty(flags.pretty)

    await start(options as StartOption)
  }

  normalizePrefix (prefix?: string): string {
    return prefix ?? ''
  }

  async normalizeEntry (entry: string): Promise<string> {
    try {
      await access(resolve(process.cwd(), entry), constants.F_OK | constants.R_OK)
      return entry
    } catch {
      throw Error(`entry file "${entry}" is not exist in ${process.cwd()} or do not have have permission to read.`)
    }
  }

  async normalizeRequire (requires?: string | string[]): Promise<string[]> {
    const array: string[] = []
    if (requires === undefined) return array
    requires = typeof requires === 'string' ? [requires] : requires

    for (const p of requires) {
      if (p.trim() !== '') array.push(p.trim())
    }

    return array
  }

  normalizePort (port: number): number {
    // when port is default
    // env take precedence
    return port === 3000 ? process.env.PORT as any ?? port : port
  }

  normalizeAddress (address: string): string {
    return address
  }

  normalizeDebug (debug?: boolean): boolean {
    return debug ?? false
  }

  normalizeDebugPort (debugPort?: number): number {
    return debugPort ?? 9320
  }

  async normalizeDebugAddress (debugAddress?: string): Promise<string> {
    const { default: isDocker } = await _import('is-docker')
    return debugAddress ?? (isDocker() === true ? '0.0.0.0' : 'localhost')
  }

  normalizePretty (pretty?: boolean): boolean {
    return pretty ?? false
  }

  // start fastify instance
  static async start (options?: Partial<StartOption>): Promise<void> {
  }
}
