import { Writable } from 'stream'
import { sleep } from './sleep'

export const ESC = '\u001B['
export const KEY_UP = `${ESC}1A`
export const KEY_DOWN = `${ESC}1B`

export async function press (stream: Writable, keycode: string): Promise<void> {
  stream.write(keycode)
  await sleep(100)
}
