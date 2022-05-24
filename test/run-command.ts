import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { Writable } from 'stream'
import { sleep } from './sleep'

export const ENTER = '\n'
export const ESC = '\u001B['
export const KEY_UP = `${ESC}1A`
export const KEY_DOWN = `${ESC}1B`

export async function press (stream: Writable, keycode: string): Promise<void> {
  stream.write(keycode)
  await sleep(100)
}

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

export class CustomWritable extends Writable {
  lines: string[] = []

  _write (chunk: any, encoding: BufferEncoding, done: (error?: Error) => void): void {
    this.lines.push(chunk.toString())
    done()
  }

  async until (line: string | RegExp | ((line: string) => boolean)): Promise<void> {
    return await until(this, line)
  }
}

interface CustomStdIn extends Writable {
  press: (keycode: string) => Promise<void>
  writeLn: (line: string) => Promise<void>
}

export function runCommand (args: string[] = []): {
  stdout: CustomWritable
  stderr: CustomWritable
  stdin: CustomStdIn
  child: ChildProcessWithoutNullStreams
} {
  const child = spawn('node', ['bin/dev', ...args])
  const stderr = new CustomWritable()
  const stdout = new CustomWritable()
  const stdin = child.stdin as CustomStdIn
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)

  child.once('exit', () => {
    stdout.end()
    stderr.end()
  })

  stdin.press = async function (keycode: string): Promise<void> {
    stdin.write(keycode)
    await sleep(100)
  }

  stdin.writeLn = async function (line: string): Promise<void> {
    stdin.write(`${line}${ENTER}`)
    await sleep
  }

  return {
    stdout,
    stdin,
    stderr,
    child
  }
}
