

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g fastify-cli
$ fastify COMMAND
running command...
$ fastify (--version)
fastify-cli/0.0.0 linux-x64 node-v18.2.0
$ fastify --help [COMMAND]
USAGE
  $ fastify COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`fastify generate`](#fastify-generate)
* [`fastify generate project [NAME]`](#fastify-generate-project-name)
* [`fastify help [COMMAND]`](#fastify-help-command)

## `fastify generate`

Generate fastify project

```
USAGE
  $ fastify generate

DESCRIPTION
  Generate fastify project
```

_See code: [dist/commands/generate/index.ts](https://github.com/fastify/fastify-cli/blob/v0.0.0/dist/commands/generate/index.ts)_

## `fastify generate project [NAME]`

Generate fastify project

```
USAGE
  $ fastify generate project [NAME]

ARGUMENTS
  NAME  Project name

DESCRIPTION
  Generate fastify project
```

## `fastify help [COMMAND]`

Display help for fastify.

```
USAGE
  $ fastify help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for fastify.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_
<!-- commandsstop -->
