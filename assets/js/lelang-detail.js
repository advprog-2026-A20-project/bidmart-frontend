import { getUser, request, setUser } from './api.js'

const params = new URLSearchParams(window.location.search)
const auctionId = params.get('id')

const titleEl = document.querySelector('#auction-title')
const descriptionEl = document.querySelector('#auction-description')
const statusEl = document.querySelector('#auction-status')
const currentPriceEl = document.querySelector('#auction-current-price')
const minimumBidEl = document.querySelector('#auction-minimum-bid')
const endsAtEl = document.querySelector('#auction-ends-at')
const bidForm = document.querySelector('#bid-form')
const bidAmountInput = document.querySelector('#bid-amount')
const bidSubmit = document.querySelector('#bid-submit')
const bidError = document.querySelector('#bid-error')
const bidSuccess = document.querySelector('#bid-success')
const bidHistoryEl = document.querySelector('#bid-history')
const bidHistoryEmptyEl = document.querySelector('#bid-history-empty')
const detailErrorBox = document.querySelector('#detail-error-box')
const detailErrorMessage = document.querySelector('#detail-error-message')
const refreshButton = document.querySelector('#refresh-detail')
const activateButton = document.querySelector('#activate-auction')

const statusLabel = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXTENDED: 'EXTENDED',
  CLOSED: 'CLOSED',
  WON: 'WON',
  UNSOLD: 'UNSOLD',
  CANCELLED: 'CANCELLED',
}

const formatPrice = (value) => {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) {
    return '-'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue)
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '-'
  }

  return parsed.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const setBidEnabled = (enabled) => {
  if (bidAmountInput) bidAmountInput.disabled = !enabled
  if (bidSubmit) bidSubmit.disabled = !enabled
}

const getMinimumBidAmount = (auction) => {
  const leadingBid = getLeadingBid(auction)
  const nextMinimumBid = Number(auction?.nextMinimumBid)
  if (Number.isFinite(nextMinimumBid) && nextMinimumBid > 0) {
    return nextMinimumBid
  }

  const currentPrice = Number(auction?.currentPrice)
  const minimumBidIncrement = Number(auction?.minimumBidIncrement)
  if (leadingBid && Number.isFinite(currentPrice) && Number.isFinite(minimumBidIncrement)) {
    return currentPrice + minimumBidIncrement
  }

  const startingPrice = Number(auction?.startingPrice)
  if (Number.isFinite(startingPrice) && startingPrice > 0) {
    return startingPrice
  }

  return Number.isFinite(currentPrice) ? currentPrice : 0
}

const refreshWalletBalance = async () => {
  const wallet = await request('/wallet/balance', { auth: true })
  const currentUser = getUser()
  if (currentUser) {
    const availableBalance = wallet.availableBalance ?? wallet.balance ?? currentUser.availableBalance ?? 0
    setUser({
      ...currentUser,
      balance: availableBalance,
      availableBalance,
      heldBalance: wallet.heldBalance ?? currentUser.heldBalance ?? 0,
    })
  }
  return wallet
}

const getLeadingBid = (auction) => {
  if (auction?.leadingBid) {
    return auction.leadingBid
  }

  const bids = Array.isArray(auction?.bidHistory) && auction.bidHistory.length > 0
    ? auction.bidHistory
    : currentBidHistory

  if (!Array.isArray(bids) || bids.length === 0) {
    return null
  }

  return [...bids].sort((leftBid, rightBid) => {
    const amountDifference = Number(rightBid?.amount || 0) - Number(leftBid?.amount || 0)
    if (amountDifference !== 0) {
      return amountDifference
    }
    return Number(leftBid?.sequenceNumber || 0) - Number(rightBid?.sequenceNumber || 0)
  })[0]
}

const getRequiredAvailableBalance = (auction, amount, user) => {
  const leadingBid = getLeadingBid(auction)
  const userId = user?.id || user?.userId
  if (leadingBid?.bidderId && userId && leadingBid.bidderId === userId) {
    return Math.max(0, amount - Number(leadingBid.amount || 0))
  }
  return amount
}

const syncBidInput = (auction) => {
  if (!bidAmountInput) {
    return
  }

  const minimumBidAmount = getMinimumBidAmount(auction)
  if (!Number.isFinite(minimumBidAmount) || minimumBidAmount <= 0) {
    return
  }

  bidAmountInput.min = minimumBidAmount

  const currentValue = Number(bidAmountInput.value)
  if (!Number.isFinite(currentValue) || currentValue < minimumBidAmount) {
    bidAmountInput.value = minimumBidAmount
  }
}

const compareBidHistoryDescending = (leftBid, rightBid) => {
  const leftSequence = Number(leftBid?.sequenceNumber)
  const rightSequence = Number(rightBid?.sequenceNumber)

  if (Number.isFinite(leftSequence) && Number.isFinite(rightSequence) && leftSequence !== rightSequence) {
    return rightSequence - leftSequence
  }

  const leftSubmittedAt = new Date(leftBid?.submittedAt || 0).getTime()
  const rightSubmittedAt = new Date(rightBid?.submittedAt || 0).getTime()

  if (Number.isFinite(leftSubmittedAt) && Number.isFinite(rightSubmittedAt) && leftSubmittedAt !== rightSubmittedAt) {
    return rightSubmittedAt - leftSubmittedAt
  }

  return 0
}

const renderHistory = (history = []) => {
  if (!bidHistoryEl || !bidHistoryEmptyEl) {
    return
  }

  bidHistoryEl.innerHTML = ''
  bidHistoryEmptyEl.classList.toggle('hidden', history.length > 0)

  const orderedHistory = Array.isArray(history)
    ? [...history].sort(compareBidHistoryDescending)
    : []

  orderedHistory.forEach((bid) => {
    const item = document.createElement('article')
    item.className = 'rounded-xl border px-4 py-3 text-sm'
    item.classList.add(
      ...(bid.winning
        ? ['border-emerald-600/30', 'bg-emerald-950/20']
        : ['border-slate-800', 'bg-slate-950']),
    )

    item.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <strong>${formatPrice(bid.amount)}</strong>
        <span class="text-xs text-slate-400">#${bid.sequenceNumber}</span>
      </div>
      <p class="mt-1 text-xs text-slate-400">${bid.bidderEmail || '-'}</p>
      <p class="mt-1 text-xs text-slate-500">${formatDate(bid.submittedAt)}</p>
      ${bid.winning ? '<p class="mt-1 text-xs text-emerald-300">Bid tertinggi</p>' : ''}
    `

    bidHistoryEl.appendChild(item)
  })
}

const applyBidConstraint = (auction) => {
  const user = getUser()
  const canBidStatus = auction?.status === 'ACTIVE' || auction?.status === 'EXTENDED'
  const isBuyer = user?.role === 'BUYER'

  if (!canBidStatus) {
    setBidEnabled(false)
    bidError.textContent = 'Lelang tidak menerima bid pada status saat ini.'
    return
  }

  if (!isBuyer) {
    setBidEnabled(false)
    bidError.textContent = 'Hanya akun BUYER yang dapat mengajukan penawaran.'
    return
  }

  setBidEnabled(true)
  bidError.textContent = ''
}

const syncActivationAction = (auction) => {
  if (!activateButton) {
    return
  }

  const user = getUser()
  const canActivate = auction?.status === 'DRAFT'
    && user?.role === 'SELLER'
    && user?.id === auction?.sellerId

  activateButton.classList.toggle('hidden', !canActivate)
  activateButton.disabled = !canActivate
}

let currentAuction = null
let currentBidHistory = []

const loadAuctionDetail = async () => {
  if (!auctionId) {
    detailErrorBox?.classList.remove('hidden')
    if (detailErrorMessage) {
      detailErrorMessage.textContent = 'ID lelang tidak ditemukan.'
    }
    setBidEnabled(false)
    return
  }

  detailErrorBox?.classList.add('hidden')
  bidSuccess.textContent = ''

  try {
    const [auction, history] = await Promise.all([
      request(`/auctions/${auctionId}`, { auth: false }),
      request(`/auctions/${auctionId}/bids`, { auth: false }),
    ])
    currentBidHistory = Array.isArray(history) ? history : []
    currentAuction = {
      ...auction,
      bidHistory: Array.isArray(auction?.bidHistory) ? auction.bidHistory : currentBidHistory,
    }

    titleEl.textContent = auction?.title || 'Lelang'
    descriptionEl.textContent = auction?.description || ''
    statusEl.textContent = statusLabel[auction?.status] || auction?.status || '-'
    currentPriceEl.textContent = formatPrice(auction?.currentPrice)
    minimumBidEl.textContent = formatPrice(getMinimumBidAmount(auction))
    endsAtEl.textContent = formatDate(auction?.endsAt)
    syncBidInput(auction)

    renderHistory(currentBidHistory)
    applyBidConstraint(currentAuction)
    syncActivationAction(currentAuction)
  } catch (error) {
    detailErrorBox?.classList.remove('hidden')
    if (detailErrorMessage) {
      detailErrorMessage.textContent = error.message || 'Gagal memuat detail lelang.'
    }
    setBidEnabled(false)
    syncActivationAction(null)
  }
}

if (bidForm) {
  bidForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    bidError.textContent = ''
    bidSuccess.textContent = ''

    if (!currentAuction) {
      bidError.textContent = 'Data lelang belum siap.'
      return
    }

    try {
      await loadAuctionDetail()
    } catch {
      // The existing auction snapshot can still be used; the backend remains authoritative.
    }

    const amount = Number(bidAmountInput?.value || 0)
    const minimum = getMinimumBidAmount(currentAuction)
    let user = getUser()

    if (!Number.isFinite(amount) || amount <= 0) {
      bidError.textContent = 'Nominal bid tidak valid.'
      return
    }

    if (amount < minimum) {
      bidError.textContent = `Bid minimal ${formatPrice(minimum)}.`
      return
    }

    try {
      const wallet = await refreshWalletBalance()
      user = getUser() || user
      const requiredAvailableBalance = getRequiredAvailableBalance(currentAuction, amount, user)
      const availableBalance = Number(wallet?.availableBalance ?? wallet?.balance ?? 0)
      if (availableBalance < requiredAvailableBalance) {
        console.info('Wallet balance appears insufficient locally; submitting anyway so backend can decide.', {
          availableBalance,
          requiredAvailableBalance,
        })
      }
    } catch {
      // Keep the backend as the source of truth when the balance refresh fails.
    }

    setBidEnabled(false)
    bidSubmit.textContent = 'Mengirim...'

    try {
      await request(`/auctions/${auctionId}/bids`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ amount }),
      })
      bidSuccess.textContent = 'Bid berhasil diajukan.'
      await refreshWalletBalance()
      await loadAuctionDetail()
    } catch (error) {
      const message = error.message || 'Gagal mengajukan bid.'

      if (error.status === 409) {
        try {
          await loadAuctionDetail()
        } catch {
          // Keep showing the server rejection even if the refresh fails.
        }
      }

      applyBidConstraint(currentAuction)
      bidError.textContent = error.status === 409
        ? `${message}. Bid minimum terbaru sudah dimuat ulang.`
        : message
    } finally {
      bidSubmit.textContent = 'Ajukan Penawaran'
    }
  })
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    loadAuctionDetail()
  }
})

if (activateButton) {
  activateButton.addEventListener('click', async () => {
    bidError.textContent = ''
    bidSuccess.textContent = ''

    if (!currentAuction) {
      bidError.textContent = 'Data lelang belum siap.'
      return
    }

    activateButton.disabled = true
    activateButton.textContent = 'Mengaktifkan...'

    try {
      await request(`/auctions/${auctionId}/activate`, {
        method: 'POST',
        auth: true,
      })
      await loadAuctionDetail()
      bidSuccess.textContent = 'Draft auction berhasil diaktifkan.'
    } catch (error) {
      bidError.textContent = error.message || 'Gagal mengaktifkan draft auction.'
      syncActivationAction(currentAuction)
    } finally {
      activateButton.textContent = 'Aktifkan Lelang'
    }
  })
}

if (refreshButton) {
  refreshButton.addEventListener('click', () => {
    loadAuctionDetail()
  })
}

loadAuctionDetail()
window.setInterval(loadAuctionDetail, 5000)
