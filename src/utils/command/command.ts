// This file actually address the issue from
// https://github.com/oclif/oclif/issues/190
import { Command as RawCommand, Interfaces } from '@oclif/core'
import * as Parser from './parser'

export abstract class Command extends RawCommand {
  protected async parse<F, G, A extends { [name: string]: any }>(options?: Interfaces.Input<F, G>, argv = this.argv): Promise<Interfaces.ParserOutput<F, G, A>> {
    if (options == null) options = this.constructor as any
    const opts = { context: this, ...options }
    // the spread operator doesn't work with getters so we have to manually add it here
    opts.flags = options?.flags
    return await Parser.parse(argv, opts)
  }
}
