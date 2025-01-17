import React from 'react'
import '@testing-library/jest-dom/extend-expect'

import { fireEvent, render } from '@testing-library/react'
import { LocalFile } from 'generic-filehandle'
import { TextEncoder } from 'web-encoding'
import { clearCache } from '@jbrowse/core/util/io/RemoteFileWithRangeCache'
import { clearAdapterCache } from '@jbrowse/core/data_adapters/dataAdapterCache'
import { readConfObject, getConf } from '@jbrowse/core/configuration'
import PluginManager from '@jbrowse/core/PluginManager'

import JBrowseRootModelFactory from '../rootModel'
import corePlugins from '../corePlugins'
import * as sessionSharing from '../sessionSharing'
import volvoxConfigSnapshot from '../../test_data/volvox/config.json'
import { JBrowse, setup, getPluginManager, generateReadBuffer } from './util'
import TestPlugin from './TestPlugin'
jest.mock('../makeWorkerInstance', () => () => {})

window.TextEncoder = TextEncoder
setup()

const waitForOptions = { timeout: 15000 }

beforeEach(() => {
  clearCache()
  clearAdapterCache()
  fetch.resetMocks()
  fetch.mockResponse(
    generateReadBuffer(url => {
      return new LocalFile(require.resolve(`../../test_data/volvox/${url}`))
    }),
  )
})

describe('<JBrowse />', () => {
  it('renders with an empty config', async () => {
    const pm = getPluginManager({})
    const { findByText } = render(<JBrowse pluginManager={pm} />)
    await findByText('Help')
  })
  it('renders with an initialState', async () => {
    const pm = getPluginManager()
    const { findByText } = render(<JBrowse pluginManager={pm} />)
    await findByText('Help')
  })
})

test('lollipop track test', async () => {
  const pm = getPluginManager()
  const state = pm.rootModel
  const { findByTestId, findByText } = render(<JBrowse pluginManager={pm} />)
  await findByText('Help')
  state.session.views[0].setNewView(1, 150)
  fireEvent.click(await findByTestId('htsTrackEntry-lollipop_track'))

  await findByTestId('display-lollipop_track_linear', {}, waitForOptions)
  await findByTestId('three', {}, waitForOptions)
}, 10000)

test('toplevel configuration', () => {
  const pm = new PluginManager([...corePlugins, TestPlugin].map(P => new P()))
  pm.createPluggableElements()
  const JBrowseRootModel = JBrowseRootModelFactory(pm, true)
  const rootModel = JBrowseRootModel.create({
    jbrowse: volvoxConfigSnapshot,
    assemblyManager: {},
  })
  rootModel.setDefaultSession()
  pm.setRootModel(rootModel)
  pm.configure()
  const state = pm.rootModel
  const { jbrowse } = state
  const { configuration } = jbrowse
  // test reading top level configurations added by Test Plugin
  const test = getConf(jbrowse, ['TestPlugin', 'topLevelTest'])
  const test2 = readConfObject(configuration, ['TestPlugin', 'topLevelTest'])
  expect(test).toEqual('test works')
  expect(test2).toEqual('test works')
})

test('assembly aliases', async () => {
  const pm = getPluginManager()
  const state = pm.rootModel
  const { findByTestId, findByText } = render(<JBrowse pluginManager={pm} />)
  await findByText('Help')
  state.session.views[0].setNewView(0.05, 5000)
  fireEvent.click(
    await findByTestId('htsTrackEntry-volvox_filtered_vcf_assembly_alias'),
  )
  await findByTestId('box-test-vcf-604452', {}, waitForOptions)
})

test('nclist track test with long name', async () => {
  const pm = getPluginManager()
  const state = pm.rootModel
  const { findByTestId, findByText } = render(<JBrowse pluginManager={pm} />)
  await findByText('Help')
  state.session.views[0].setNewView(1, -539)
  fireEvent.click(await findByTestId('htsTrackEntry-nclist_long_names'))

  await findByText(
    'This is a gene with a very long name it is crazy abcdefghijklmnopqrstuvwxyz1...',
    {},
    waitForOptions,
  )
})

test('test sharing', async () => {
  sessionSharing.shareSessionToDynamo = jest.fn().mockReturnValue({
    encryptedSession: 'A',
    json: {
      sessionId: 'abc',
    },
    password: '123',
  })
  const pm = getPluginManager()
  const { findByTestId, findByText } = render(<JBrowse pluginManager={pm} />)
  await findByText('Help')
  fireEvent.click(await findByText('Share'))

  // check the share dialog has the above session shared
  await findByTestId('share-dialog')
  const url = await findByTestId('share-url-text')
  expect(url.value).toBe('http://localhost/?session=share-abc&password=123')
})

test('looks at about this track dialog', async () => {
  const pm = getPluginManager()
  const { findByTestId, findAllByText, findByText } = render(
    <JBrowse pluginManager={pm} />,
  )
  await findByText('Help')

  // load track
  fireEvent.click(await findByTestId('htsTrackEntry-volvox-long-reads-cram'))
  fireEvent.click(await findByTestId('track_menu_icon', {}, waitForOptions))
  fireEvent.click(await findByText('About track'))
  await findAllByText(/SQ/, {}, waitForOptions)
}, 15000)
