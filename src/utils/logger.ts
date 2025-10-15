import process from 'node:process'
import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'
  && process.env.FORCE_PRETTY !== '0'

const transport = isDev
  ? pino.transport({
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', singleLine: false },
    })
  : undefined

const logger = transport
  ? pino(transport)
  : pino({ level: process.env.LOG_LEVEL ?? 'info' })

export default logger
