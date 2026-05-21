import { describe, expect, it, vi } from 'vitest'
import {
  flushPromises,
  importFresh,
  jsonResponse,
  moduleVariants,
  setPage,
} from './helpers/module-utils.js'

const buildAuctionListMarkup = () => `
  <form id="auction-filter-form">
    <select id="auction-status">
      <option value="ALL">ALL</option>
      <option value="CLOSED">CLOSED</option>
    </select>
    <button type="submit">Apply</button>
    <button type="reset">Reset</button>
  </form>
  <div id="auctions-skeleton" class="hidden"></div>
  <div id="auctions-empty" class="hidden"></div>
  <div id="auctions-error" class="hidden"><span id="auctions-error-message"></span></div>
  <button id="auctions-retry" type="button">Retry</button>
  <div id="auctions-container"></div>
`

const auction = {
  id: 'auction-1',
  title: 'Phone Auction',
  status: 'CLOSED',
  totalBids: 2,
  currentPrice: 1250,
  nextMinimumBid: 1260,
  endsAt: '2026-04-21T10:00:00Z',
}

describe.each(moduleVariants)('$label lelang.js', ({ basePath }) => {
  it('defaults status to ALL and omits status query param', async () => {
    setPage('/pages/lelang.html')
    document.body.insertAdjacentHTML('beforeend', buildAuctionListMarkup())

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([auction]))
    vi.stubGlobal('fetch', fetchMock)

    await importFresh(`${basePath}/lelang.js`)
    await flushPromises()

    expect(document.querySelector('#auction-status').value).toBe('ALL')
    expect(fetchMock).toHaveBeenCalledWith('/api/auctions', expect.objectContaining({ auth: false }))
    expect(document.querySelector('#auctions-container').textContent).toContain('Phone Auction')
  })

  it('passes a selected auction status filter', async () => {
    setPage('/pages/lelang.html?status=CLOSED')
    document.body.insertAdjacentHTML('beforeend', buildAuctionListMarkup())

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([auction]))
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    await importFresh(`${basePath}/lelang.js`)
    await flushPromises()

    expect(document.querySelector('#auction-status').value).toBe('CLOSED')
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/auctions?status=CLOSED', expect.objectContaining({ auth: false }))

    document.querySelector('#auction-status').value = 'ALL'
    document.querySelector('#auction-filter-form').dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true }),
    )
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auctions', expect.objectContaining({ auth: false }))
    expect(window.location.search).toBe('')
  })
})
