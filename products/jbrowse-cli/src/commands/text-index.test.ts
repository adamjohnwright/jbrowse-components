/**
 * @jest-environment node
 */

import { setup } from '../testUtil'
import fs from 'fs'
import path from 'path'

const configPath = path.join(
  __dirname,
  '..',
  '..',
  'test',
  'data',
  'indexing_config.json',
)
const ixIxxPath = path.join(__dirname, '..', '..', 'test', 'ixIxx')
const ixLoc = path.join(__dirname, '..', '..', 'test', 'data', 'volvox.ix')
const ixxLoc = path.join(__dirname, '..', '..', 'test', 'data', 'volvox.ixx')

function verifyIxxFiles(ixLoc: string, ixxLoc: string) {
  const ixdata = fs.readFileSync(ixLoc, 'utf8')
  const ixxdata = fs.readFileSync(ixxLoc, 'utf8')
  expect(ixdata.slice(0, 1000)).toMatchSnapshot()
  expect(ixdata.slice(-1000)).toMatchSnapshot()
  expect(ixdata.length).toMatchSnapshot()
  expect(ixxdata).toMatchSnapshot()
}

// Base text index command
// Test throwing an error if --tracks and no track ids provided
describe('textIndexCommandErrors', () => {
  setup
    .command(['text-index', '--tracks'])
    .catch('Flag --tracks expects a value')
    .it('fails if no track ids are provided to the command with --tracks flag.')

  setup
    .command(['text-index', '--Command'])
    .catch(err => {
      expect(err.message).toContain('Unexpected argument:')
    })
    .it('fails if there is an invalid flag')
})

// Non-Gzipped File
describe('text-index', () => {
  setup
    .do(async ctx => {
      const gff3File = path.join(
        __dirname,
        '..',
        '..',
        'test',
        'data',
        'au9_scaffold_subset_sync.gff3',
      )
      fs.copyFileSync(gff3File, path.join(ctx.dir, path.basename(gff3File)))
      fs.copyFileSync(configPath, path.join(ctx.dir, 'config.json'))
      fs.copyFileSync(ixIxxPath, path.join(ctx.dir, 'ixIxx'))
    })
    .command(['text-index', '--tracks=au9_scaffold', '--target=config.json'])
    .it('Indexes a local non-gz gff3 file', async () => {
      verifyIxxFiles(ixLoc, ixxLoc)
    })
})

// Gzipped File
describe('text-index tracks', () => {
  setup
    .do(async ctx => {
      const gff3File = path.join(
        __dirname,
        '..',
        '..',
        'test',
        'data',
        'volvox.sort.gff3.gz',
      )
      fs.copyFileSync(gff3File, path.join(ctx.dir, path.basename(gff3File)))
      fs.copyFileSync(configPath, path.join(ctx.dir, 'config.json'))
      fs.copyFileSync(ixIxxPath, path.join(ctx.dir, 'ixIxx'))
    })
    .command(['text-index', '--tracks=gff3tabix_genes', '--target=config.json'])
    .it('Indexes a local gz gff3 file', async () => {
      verifyIxxFiles(ixLoc, ixxLoc)
    })
})

// Remote GZ
describe('text-index tracks', () => {
  setup
    .do(async ctx => {
      fs.copyFileSync(configPath, path.join(ctx.dir, 'config.json'))
      fs.copyFileSync(ixIxxPath, path.join(ctx.dir, 'ixIxx'))
    })
    .command([
      'text-index',
      '--tracks=online_gff3tabix_genes',
      '--target=config.json',
    ])
    .it('Indexes a remote gz gff3 file', async () => {
      verifyIxxFiles(ixLoc, ixxLoc)
    })
})

// Remote Non-GZ

describe('text-index tracks', () => {
  setup
    .do(async ctx => {
      fs.copyFileSync(configPath, path.join(ctx.dir, 'config.json'))
      fs.copyFileSync(ixIxxPath, path.join(ctx.dir, 'ixIxx'))
    })
    .command([
      'text-index',
      '--tracks=online_au9_scaffold',
      '--target=config.json',
    ])
    .it('Indexes a remote non-gz gff3 file', async () => {
      verifyIxxFiles(ixLoc, ixxLoc)
    })
})

// 2 Local Files

describe('text-index tracks', () => {
  setup
    .do(async ctx => {
      const gff3File = path.join(
        __dirname,
        '..',
        '..',
        'test',
        'data',
        'volvox.sort.gff3.gz',
      )
      const gff3File2 = path.join(
        __dirname,
        '..',
        '..',
        'test',
        'data',
        'au9_scaffold_subset_sync.gff3',
      )
      fs.copyFileSync(gff3File, path.join(ctx.dir, path.basename(gff3File)))
      fs.copyFileSync(gff3File2, path.join(ctx.dir, path.basename(gff3File2)))
      fs.copyFileSync(configPath, path.join(ctx.dir, 'config.json'))
      fs.copyFileSync(ixIxxPath, path.join(ctx.dir, 'ixIxx'))
    })
    .command([
      'text-index',
      '--tracks=gff3tabix_genes,au9_scaffold',
      '--target=config.json',
    ])
    .it('Indexes multiple local gff3 files', async () => {
      verifyIxxFiles(ixLoc, ixxLoc)
    })
})

describe('text-index tracks', () => {
  setup
    .do(async ctx => {
      fs.copyFileSync(configPath, path.join(ctx.dir, 'config.json'))
      fs.copyFileSync(ixIxxPath, path.join(ctx.dir, 'ixIxx'))
    })
    .command([
      'text-index',
      '--tracks=online_gff3tabix_genes,online_au9_scaffold',
      '--target=config.json',
    ])
    .it('Indexes multiple remote gff3 file', async () => {
      verifyIxxFiles(ixLoc, ixxLoc)
    })
})

// URL and Local
describe('text-index tracks', () => {
  setup
    .do(async ctx => {
      const gff3File = path.join(
        __dirname,
        '..',
        '..',
        'test',
        'data',
        'volvox.sort.gff3.gz',
      )
      fs.copyFileSync(gff3File, path.join(ctx.dir, path.basename(gff3File)))
      fs.copyFileSync(configPath, path.join(ctx.dir, 'config.json'))
      fs.copyFileSync(ixIxxPath, path.join(ctx.dir, 'ixIxx'))
    })
    .command([
      'text-index',
      '--tracks=gff3tabix_genes,online_au9_scaffold',
      '--target=config.json',
    ])
    .it('Indexes a remote and a local file', async () => {
      verifyIxxFiles(ixLoc, ixxLoc)
    })
})

// This test is commented out due to how long it takes to complete
/*
// Aggregate File
describe('text-index tracks', () => {
  setup
    .do(async ctx => {
      const gff3File = path.join(
        __dirname,
        '..',
        '..',
        'test',
        'data',
        'volvox.sort.gff3.gz',
      )
      const gff3File2 = path.join(
        __dirname,
        '..',
        '..',
        'test',
        'data',
        'au9_scaffold_subset_sync.gff3',
      )
      await fsPromises.copyFile(
        gff3File,
        path.join(ctx.dir, path.basename(gff3File)),
      )
      await fsPromises.copyFile(
        gff3File2,
        path.join(ctx.dir, path.basename(gff3File2)),
      )
      await fsPromises.copyFile(
        configPath,
        path.join(ctx.dir, 'test_config.json'),
      )
      await fsPromises.rename(
        path.join(ctx.dir, 'test_config.json'),
        path.join(ctx.dir, 'config.json'),
      )
      await fsPromises.copyFile(ixIxxPath, path.join(ctx.dir, 'ixIxx'))
      await readFile(path.join(ctx.dir, 'config.json'), 'utf8')
    })
    .command(['text-index', `--target=${path.join('config.json')}` ])
    .it('Indexes multiple local gff3 files', async ctx => {
      const ixdata = JSON.stringify(
        readFileSync(ixLoc, {
          encoding: 'utf8',
          flag: 'r',
        }),
      )
      expect(ixdata).toMatchSnapshot()
      const ixxData = JSON.stringify(
        readFileSync(ixxLoc, {
          encoding: 'utf8',
          flag: 'r',
        }),
      )
      expect(ixxData).toMatchSnapshot()
    })
})
*/