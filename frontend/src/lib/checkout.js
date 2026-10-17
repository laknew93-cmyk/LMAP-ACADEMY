import api from '../api/client'
import { SITE } from '../site'

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = resolve
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'))
    document.body.appendChild(s)
  })
}

// Starts checkout for one course ({ course_slug }) or the bundle ({ bundle: true }).
// Resolves with the purchased course slugs once payment is verified; rejects on failure,
// and resolves null if the buyer closes the payment window.
export async function checkout(payload) {
  const { data } = await api.post('/payments/create-order', payload)
  if (data.enrolled) return data.course_slugs

  const verify = async r => {
    const res = await api.post('/payments/verify', {
      razorpay_order_id: r.razorpay_order_id,
      razorpay_payment_id: r.razorpay_payment_id,
      razorpay_signature: r.razorpay_signature,
    })
    return res.data.course_slugs
  }

  if (data.dev) {
    return verify({ razorpay_order_id: data.order_id, razorpay_payment_id: 'pay_dev_' + Date.now(), razorpay_signature: 'dev' })
  }

  await loadRazorpay()
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: SITE.name,
      description: data.title,
      order_id: data.order_id,
      prefill: data.prefill,
      theme: { color: '#6D28D9' },
      handler: r => verify(r).then(resolve).catch(() =>
        reject(new Error(`Payment received but verification failed. Email ${SITE.email} with your payment ID ${r.razorpay_payment_id}.`))),
      modal: { ondismiss: () => resolve(null) },
    })
    rzp.on('payment.failed', e => reject(new Error(e.error?.description || 'Payment failed')))
    rzp.open()
  })
}
