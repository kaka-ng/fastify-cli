import t from 'tap'
import { runCommand } from '../../run-command'
import { until } from '../../until'

t.test('JavaScript + Standard', async (t) => {
  const { stdout, stdin } = runCommand(['generate', 'project'])
  await until(stdout, /What is your project name?/)
  stdin.write('foo\n')
  await until(stdout, /Where do you want to place your project?/)
  stdin.write('dump/foo\n')
  await until(stdout, /Which language will you use?/)
  stdin.write('\n')
  await until(stdout, /Which linter would you like to use?/)
  stdin.write('\n')
  await until(stdout, /Which test framework would you like to use?/)
  stdin.write('\n')
  await until(stdout, /Do you want to run "npm install"?/)
  stdin.write('N\n')
})
