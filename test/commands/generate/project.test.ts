import { randomUUID } from 'crypto'
import { rm } from 'fs/promises'
import { resolve } from 'path'
import t from 'tap'
import { ENTER, runCommand } from '../../run-command'

t.test('JavaScript + Standard', async (t) => {
  const name = randomUUID()
  t.plan(6)
  const { stdout, stdin } = runCommand(['generate', 'project'])
  await stdout.until(/What is your project name?/)
  stdin.writeLn(name)
  t.pass('project name')
  await stdout.until(/Where do you want to place your project?/)
  stdin.writeLn(name)
  t.pass('project location')
  await stdout.until(/Which language will you use?/)
  stdin.press(ENTER)
  t.pass('project language')
  await stdout.until(/Which linter would you like to use?/)
  stdin.press(ENTER)
  t.pass('project lint')
  await stdout.until(/Which test framework would you like to use?/)
  stdin.press(ENTER)
  t.pass('project test framework')
  await stdout.until(/Do you want to run "npm install"?/)
  stdin.writeLn('N')
  t.pass('project npm install')

  t.teardown(async function () {
    await rm(resolve(name), { recursive: true, force: true })
  })
})
