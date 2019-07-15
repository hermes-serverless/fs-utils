import { Waiter } from '@hermes-serverless/custom-promises'
import fs, { PathLike } from 'fs'
import { Readable, Writable } from 'stream'
import util from 'util'

const setupWaiter = (stream: Readable | Writable, waiter: Waiter<any>) => {
  const onOpen = () => {
    waiter.resolve(stream)
  }

  const onError = (err: Error) => {
    waiter.reject(err)
  }

  const clear = () => {
    stream.removeListener('open', onOpen)
    stream.removeListener('error', onError)
  }

  stream.once('error', onError)
  stream.once('open', onOpen)
  waiter.then(clear, clear)
}

export const createFsReadStream = (
  path: PathLike,
  options?:
    | string
    | {
        flags?: string
        encoding?: string
        fd?: number
        mode?: number
        autoClose?: boolean
        start?: number
        end?: number
        highWaterMark?: number
      }
): Promise<Readable> => {
  const openWaiter: Waiter<Readable> = new Waiter()
  const stream = fs.createReadStream(path, options)
  setupWaiter(stream, openWaiter)
  return openWaiter.finish()
}

export const createFsWriteStream = (
  path: PathLike,
  options?:
    | string
    | {
        flags?: string
        encoding?: string
        fd?: number
        mode?: number
        autoClose?: boolean
        start?: number
      }
): Promise<Writable> => {
  const openWaiter: Waiter<Writable> = new Waiter()
  const stream = fs.createWriteStream(path, options)
  setupWaiter(stream, openWaiter)
  return openWaiter.finish()
}

export const fileExists = async (filepath: string) => {
  try {
    await util.promisify(fs.access)(filepath)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
    throw err
  }
}
