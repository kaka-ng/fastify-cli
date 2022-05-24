import { rm } from 'fs/promises'
import { join, resolve } from 'path'
import t from 'tap'
import { ENTER, runCommand, runRawCommand } from '../../run-command'

t.test('JavaScript + Standard', async (t) => {
  const name = 'javascript-standard'
  const location = resolve(join('test', 'fixtures', name))

  t.teardown(async () => {
    await rm(location, { recursive: true, force: true })
  })

  t.plan(8)
  const { stdout, stdin } = runCommand(['generate', 'project'])

  await stdout.until(/What is your project name?/)
  stdin.writeLn(name)
  t.pass('project name')
  await stdout.until(/Where do you want to place your project?/)
  stdin.writeLn(location)
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
  // TODO: it take too long for Github Actions to run npm install
  // stdin.press(ENTER)
  // await stdout.until(/initialized in/)
  // t.pass('project node_modules installed')

  t.test('Lint', { skip: true }, async (t) => {
    t.plan(2)
    const { stdout, stderr, exited } = runRawCommand(['npm', 'run', 'lint'], { cwd: location })
    await exited
    t.same(stderr.lines, [], 'no stderr')
    t.matchSnapshot(stdout.lines)
  })

  // TODO: it should ensure the generated project coverage
  // currently, nyc is throwing in this apporach
  t.test('Test', { skip: true }, async (t) => {
    t.plan(2)
    const { stdout, stderr, exited } = runRawCommand(['npm', 'run', 'test'], { cwd: location })
    await exited
    t.same(stderr.lines, [], 'no stderr')
    t.matchSnapshot(stdout.lines)
  })
})
