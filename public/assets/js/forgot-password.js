import { request } from './api.js'
import { showToast } from './ui.js'

const forgotForm = document.querySelector('#forgot-password-form')
const verifyForm = document.querySelector('#verify-otp-form')
const resetForm = document.querySelector('#reset-password-form')

const emailStep = document.querySelector('#forgot-step-email')
const verifyStep = document.querySelector('#forgot-step-verify')
const resetStep = document.querySelector('#forgot-step-reset')

let currentEmail = ''
let currentOtp = ''

const setSubmitting = (form, isSubmitting) => {
  const button = form.querySelector('button[type="submit"]')
  const fields = form.querySelectorAll('.input-field')

  if (button) {
    if (!button.dataset.defaultText) {
      button.dataset.defaultText = button.textContent.trim()
    }
    button.textContent = isSubmitting ? 'Loading...' : button.dataset.defaultText
    button.disabled = isSubmitting
  }

  fields.forEach((field) => {
    field.disabled = isSubmitting
  })
}

const handleError = (elementId, message) => {
  const target = document.querySelector(elementId)
  if (target) {
    target.textContent = message
  }
}

const clearFieldError = (form) => {
  const fields = form.querySelectorAll('.input-field')
  fields.forEach((field) => {
    field.classList.remove('border-rose-500', 'ring-2', 'ring-rose-200')
  })
}

const applyFieldError = (form) => {
  const fields = form.querySelectorAll('.input-field')
  fields.forEach((field) => {
    field.classList.add('border-rose-500', 'ring-2', 'ring-rose-200')
  })
}

const showVerifyStep = () => {
  verifyStep?.classList.remove('hidden')
}

const showResetStep = () => {
  resetStep?.classList.remove('hidden')
}

if (forgotForm) {
  forgotForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    handleError('#forgot-error', '')
    clearFieldError(forgotForm)

    const formData = new FormData(forgotForm)
    currentEmail = String(formData.get('email') || '').trim()
    const payload = { email: currentEmail }
    setSubmitting(forgotForm, true)

    try {
      const data = await request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(payload),
        auth: false,
      })

      showToast('success', data?.message || 'Jika email terdaftar, OTP sudah dikirim')
      showVerifyStep()
    } catch (error) {
      applyFieldError(forgotForm)
      handleError('#forgot-error', error.message)
      showToast('error', error.message)
    } finally {
      setSubmitting(forgotForm, false)
    }
  })
}

if (verifyForm) {
  verifyForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    handleError('#verify-error', '')
    clearFieldError(verifyForm)

    const formData = new FormData(verifyForm)
    currentOtp = String(formData.get('otp') || '').trim()
    const payload = {
      email: currentEmail,
      otp: currentOtp,
    }
    setSubmitting(verifyForm, true)

    try {
      const data = await request('/auth/verify-reset-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
        auth: false,
      })

      showToast('success', data?.message || 'OTP valid')
      showResetStep()
    } catch (error) {
      applyFieldError(verifyForm)
      handleError('#verify-error', error.message)
      showToast('error', error.message)
    } finally {
      setSubmitting(verifyForm, false)
    }
  })
}

if (resetForm) {
  resetForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    handleError('#reset-error', '')
    clearFieldError(resetForm)

    const formData = new FormData(resetForm)
    const payload = {
      email: currentEmail,
      otp: currentOtp,
      newPassword: formData.get('newPassword'),
    }
    setSubmitting(resetForm, true)

    try {
      const data = await request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
        auth: false,
      })

      showToast('success', data?.message || 'Password berhasil direset')
      window.location.href = '/pages/login.html'
    } catch (error) {
      applyFieldError(resetForm)
      handleError('#reset-error', error.message)
      showToast('error', error.message)
    } finally {
      setSubmitting(resetForm, false)
    }
  })
}

if (!emailStep) {
  console.debug('Forgot password page is not active')
}
