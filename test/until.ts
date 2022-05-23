import { CustomWritable } from './run-command'
import { sleep } from './sleep'

export async function until (stream: CustomWritable, line: string | RegExp | ((line: string) => boolean)): Promise<void> {
  let found = false
  const match = compileMatch(line)
  while (!found) {
    await sleep(100)

    const index = stream.lines.findIndex(match)
    if (index !== -1) found = true
  }
  // we empty the buffer after found
  stream.lines = []
}

export function compileMatch (line: string | RegExp | ((line: string) => boolean)): ((line: string) => boolean) {
  if (typeof line === 'string') {
    return function match (from: string) {
      return from === line
    }
  }
  if (line instanceof RegExp) {
    return function match (from: string) {
      return line.test(from)
    }
  }
  return line
}
