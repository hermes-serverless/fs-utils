import { ReadStream, WriteStream } from 'fs'
import path from 'path'
import { createFsReadStream, createFsWriteStream, fileExists } from '..'

describe('Test createFsReadStream', () => {
  test('Open a file to read', async () => {
    const stream = await createFsReadStream(path.join(__dirname, 'fixtures', 'hello'))
    expect(stream).toBeInstanceOf(ReadStream)
    expect(stream.listenerCount('open')).toBe(0)
    expect(stream.listenerCount('error')).toBe(0)
  })

  test('Rejects with ENOENT', async () => {
    expect.assertions(1)
    try {
      await createFsReadStream(path.join(__dirname, 'fixtures', 'no-file'))
    } catch (err) {
      expect(err.code).toBe('ENOENT')
    }
  })
})

describe('Test createFsWriteStream', () => {
  test('Open a file to write', async () => {
    const stream = await createFsWriteStream(path.join(__dirname, 'fixtures', 'new-file.tmp'))
    expect(stream).toBeInstanceOf(WriteStream)
    expect(stream.listenerCount('open')).toBe(0)
    expect(stream.listenerCount('error')).toBe(0)
  })

  test('Rejects with ENOENT', async () => {
    expect.assertions(1)
    try {
      await createFsWriteStream(path.join(__dirname, 'fixtures', 'hello'), { flags: 'wx' })
    } catch (err) {
      expect(err.code).toBe('EEXIST')
    }
  })
})

describe('Test fileExists', () => {
  test("File doesn't exist", async () => {
    await expect(fileExists(path.join(__dirname, 'fixtures', 'file-doesnt-exist'))).resolves.toBe(
      false
    )
  })

  test('File exist', async () => {
    await expect(fileExists(path.join(__dirname, 'fixtures', 'hello'))).resolves.toBe(true)
  })
})
