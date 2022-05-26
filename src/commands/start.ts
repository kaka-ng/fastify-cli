import { Flags } from '@oclif/core'
import { constants } from 'fs'
import { access } from 'fs/promises'
import { resolve } from 'path'
import { Command } from '../utils/command/command'
import { start, StartOption } from '../utils/start'

export default class Start extends Command {
  static description = 'Start fastify instance'

  static args = [
    { name: 'entry', required: true, description: 'Entry point of fastify instance.' }
  ]

  static flags = {
    require: Flags.string({ char: 'r', description: '', multiple: true }),
    address: Flags.string({ char: 'a', description: '', default: 'localhost' }),
    port: Flags.integer({ char: 'p', description: '', default: 3000 }),
    help: Flags.help()
  }

  async run (): Promise<void> {
    const { args, flags } = await this.parse(Start)

    // we normalize the options before start
    const options: Partial<StartOption> = {}
    options.entry = await this.normalizeEntry(args.entry as string)
    options.require = await this.normalizeRequire(flags.require)
    options.port = await this.normalizePort(flags.port)
    options.address = await this.normalizeAddress(flags.address)

    await start(options as StartOption)
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

  // start fastify instance
  static async start (): Promise<void> {

  }
}
