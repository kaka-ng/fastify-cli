import { Command, Flags } from '@oclif/core'
import { compile } from 'ejs'
import { access, readFile, stat } from 'fs/promises'
import { prompt, QuestionCollection } from 'inquirer'
import { join, resolve } from 'path'

export default class Project extends Command {
  static description = 'Generate fastify project'

  static args = [
    { name: 'name', required: false, description: 'Name of the project.' }
  ]

  static flags = {
    location: Flags.string({ description: 'Location to place the project.' }),
    overwrite: Flags.boolean({ description: 'Force to overwrite the project location when it exist.', default: false }),
    language: Flags.string({ description: 'Programming Language you would like to use in this project.' }),
    lint: Flags.string({ description: 'Lint Tools you would like to use in this project.' }),
    test: Flags.string({ description: 'Test Framework you would like to use in this project.' }),
    help: Flags.help()
  }

  async run (): Promise<void> {
    const { args, flags } = await this.parse(Project)

    // validate
    if (flags.language !== undefined) this.corceLanguage(flags.language)

    const questions: QuestionCollection = [
      { type: 'input', name: 'name', message: 'What is your project name?', validate: this.questionNameValidate },
      { type: 'input', name: 'location', message: 'Where do you want to place your project?', default: this.questionLocationDefault },
      { type: 'confirm', name: 'overwrite', message: 'The folder already exist. Do you want to overwrite?', default: false, when: this.questionOverwriteWhen, askAnswered: true },
      { type: 'list', name: 'language', message: 'Which language will you use?', default: 'JavaScript', choices: ['JavaScript', 'TypeScript'] },
      { type: 'list', name: 'lint', message: 'Which linter would you like to use?', default: this.questionLintDefault, choices: this.questionLintChoices },
      { type: 'list', name: 'test', message: 'Which test framework would you like to use?', default: 'tap', choices: ['tap'] }
    ]

    const answer = await prompt(questions, {
      name: args.name,
      location: flags.location,
      overwrite: flags.overwrite,
      language: flags.language,
      lint: flags.lint,
      test: flags.test
    })

    const fileList = await this.computeFileList(answer)
    const files = await this.prepareFiles(fileList, answer)

    console.log(files)
  }

  questionNameValidate = (input: string): true | string => {
    if (String(input).trim() === '') {
      return 'Project Name cannot be empty.'
    }
    return true
  }

  questionLocationDefault = (answer: any): string => {
    return this.toLocation(answer.name)
  }

  questionOverwriteWhen = async (answer: any): Promise<boolean> => {
    return !(await this.validateProjectLocation(answer.location))
  }

  questionLintDefault =(answer: any): string => {
    switch (this.corceLanguage(answer.language)) {
      case 'JavaScript':
        return 'standard'
      case 'TypeScript':
        return 'ts-standard'
    }
  }

  questionLintChoices = (answer: any): string[] => {
    switch (this.corceLanguage(answer.language)) {
      case 'JavaScript':
        return ['standard', 'eslint', 'eslint + standard']
      case 'TypeScript':
        return ['ts-standard', 'eslint', 'eslint + ts-standard']
    }
  }

  corceLanguage (str: string): 'JavaScript' | 'TypeScript' {
    switch (str.trim().toLowerCase()) {
      case 'js':
      case 'javascript':
        return 'JavaScript'
      case 'ts':
      case 'typescript':
        return 'TypeScript'
      default:
        throw new Error(`Programming Language expected to be "JavaScript" or "TypeScript", but recieved "${str}"`)
    }
  }

  toLocation (name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, '-')
  }

  async isFileExist (path: string): Promise<boolean> {
    try {
      const stats = await stat(path)
      return stats.isFile()
    } catch {
      return false
    }
  }

  async validateProjectLocation (location: string): Promise<boolean> {
    const path = resolve(location)
    try {
      await access(path)
      return false
    } catch {
      return true
    }
  }

  computeFileList (answer: any): string[] {
    // we do not add .ejs in here
    // we should find the file if .ejs exist first and then compile to the destination
    const files: string[] = [
      'package.json'
    ]

    return files
  }

  async resolveFile (file: string): Promise<{ template: boolean, content: string }> {
    const o = { template: false, content: '' }
    const ejsPath = resolve(join('templates', 'project', `${file}.ejs`))
    const isEJSTemplate = await this.isFileExist(ejsPath)
    if (isEJSTemplate) {
      o.template = true
      const data = await readFile(ejsPath)
      o.content = data.toString()
      return o
    }
    const filePath = resolve(join('templates', 'project', file))
    const isFileExist = await this.isFileExist(filePath)
    if (isFileExist) {
      const data = await readFile(filePath)
      o.content = data.toString()
      return o
    }
    throw new Error(`File ${file} is missing, please check if the module installed properly.`)
  }

  async prepareFiles (files: string[], answer: any): Promise<{ [path: string]: string }> {
    console.log(resolve('package.json'))
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require(resolve('package.json'))
    answer.version = pkg.version
    answer.dependencies = pkg.dependencies
    answer.devDependencies = pkg.devDependencies
    const o: { [path: string]: string } = {}
    for (const file of files) {
      const { template, content } = await this.resolveFile(file)
      if (template) {
        const render = compile(content, { async: true })
        o[file] = await render(answer)
      } else {
        o[file] = content
      }
    }
    return o
  }
}
