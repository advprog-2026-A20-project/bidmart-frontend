import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  flushPromises,
  importFresh,
  jsonResponse,
  setPage,
} from './helpers/module-utils.js'

const walletVariants = [
  { label: 'public', basePath: '../../public/assets/js' },
]

const buildWalletMarkup = () => `
  <p id="wallet-balance"></p>
  <p id="summary-balance"></p>
  <p id="summary-count"></p>
  <p id="wallet-loading"></p>
  <table>
    <tbody id="transactions-body"></tbody>
  </table>
  <p id="transactions-empty" class="hidden"></p>
  <p id="wallet-error"></p>
  <form id="topup-form">
    <input id="topup-amount" value="50000" />
    <button type="submit">Top Up</button>
  </form>
`

describe.each(walletVariants)('$label wallet.js', ({ basePath }) => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('syncs the stored buyer balance after top up so bidding sees the latest wallet balance', async () => {
    setPage('/pages/wallet.html')
    document.body.insertAdjacentHTML('beforeend', buildWalletMarkup())
    localStorage.setItem('accessToken', 'buyer-token')
    localStorage.setItem('user', JSON.stringify({
      id: 'buyer-1',
      role: 'BUYER',
      availableBalance: 0,
      heldBalance: 0,
    }))

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ balance: 0, availableBalance: 0, heldBalance: 0 }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ balance: 50000, availableBalance: 50000, heldBalance: 0 }))
      .mockResolvedValueOnce(jsonResponse({ balance: 50000, availableBalance: 50000, heldBalance: 0 }))
      .mockResolvedValueOnce(jsonResponse([
        {
          id: 'tx-1',
          type: 'TOPUP',
          amount: 50000,
          balanceAfter: 50000,
          createdAt: '2026-04-20T10:00:00Z',
        },
      ]))

    vi.stubGlobal('fetch', fetchMock)

    await importFresh(`${basePath}/wallet.js`)
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    document.querySelector('#topup-form').dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true }),
    )

    await vi.waitFor(() => {
      expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({
        id: 'buyer-1',
        availableBalance: 50000,
        heldBalance: 0,
      })
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/wallet/topup',
      expect.objectContaining({
        method: 'POST',
        body: '{"amount":50000}',
        headers: expect.any(Headers),
      }),
    )
    expect(fetchMock.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer buyer-token')
    await flushPromises()
  })
})
