import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { Writable } from 'stream'

export class CustomWritable extends Writable {
  lines: string[] = []

  _write (chunk: any, encoding: BufferEncoding, done: (error?: Error) => void): void {
    this.lines.push(chunk.toString())
    done()
  }
}

export function runCommand (args: string[] = []): {
  stdout: CustomWritable
  stderr: CustomWritable
  stdin: Writable
  child: ChildProcessWithoutNullStreams
} {
  const child = spawn('node', ['bin/dev', ...args])
  const stderr = new CustomWritable()
  const stdout = new CustomWritable()
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)

  child.once('exit', () => {
    stdout.end()
    stderr.end()
  })

  return { stdout, stdin: child.stdin, stderr, child }
}
