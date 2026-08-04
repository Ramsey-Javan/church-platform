import { useEffect, useState } from 'react';
import { createDonationCheckout, getFunds } from '../api/client';
import MpesaManualInstructions from '../components/MpesaManualInstructions';

function unwrapCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.results || [];
}

export default function Give() {
  const [funds, setFunds] = useState([]);
  const [status, setStatus] = useState('loading');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fund_id: '',
    amount: '',
    recurring: false,
    method: '',
    donor_name: '',
    email: '',
    phone: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const selectedFund = funds.find((fund) => String(fund.id) === String(form.fund_id));

  useEffect(() => {
    getFunds()
      .then((data) => {
        setFunds(unwrapCollection(data));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const goToMethodStep = (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (!form.fund_id || !form.amount) {
      setErrorMessage('Choose a fund and enter an amount.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!form.method) {
      setErrorMessage('Choose a payment method.');
      return;
    }

    if (form.method === 'mpesa' && !form.phone) {
      setErrorMessage('Phone number is required for M-Pesa.');
      return;
    }

    setSubmissionStatus('saving');
    try {
      const response = await createDonationCheckout({
        ...form,
        amount: form.amount,
      });

      if (form.method === 'stripe') {
        const checkoutUrl = response.checkout_url || response.payment_url || response.url;
        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
          return;
        }
        throw new Error('Stripe checkout URL was not returned.');
      }

      setSuccessMessage(response.message || response.customer_message || 'Check your phone to complete the payment.');
      setSubmissionStatus('saved');
    } catch (error) {
      const detail = error?.response?.data;
      const message = typeof detail === 'string'
        ? detail
        : detail?.detail || detail?.message || detail?.non_field_errors?.[0] || 'We could not start the donation right now.';
      setErrorMessage(message);
      setSubmissionStatus('error');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-12">
      <section className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
          Give online
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: 'var(--color-ink)' }}>
          Support the work of the church
        </h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
          Choose a fund, amount, and payment method. Stripe redirects to checkout; M-Pesa sends an STK prompt to your phone.
        </p>
      </section>

      {status === 'error' && (
        <p className="text-sm" style={{ color: 'var(--color-gold)' }}>
          Funds could not be loaded right now.
        </p>
      )}

      <form onSubmit={step === 1 ? goToMethodStep : handleSubmit} className="rounded-3xl border p-6 md:p-8 bg-white space-y-6" style={{ borderColor: 'var(--color-rule)' }}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ background: step === 1 ? 'var(--color-gold)' : 'var(--color-rule)', color: step === 1 ? '#fff' : 'var(--color-ink)' }}>1</span>
          <span className="font-medium">Choose amount and fund</span>
          <span className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--color-sage)' }}>Step {step} of 2</span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ background: step === 2 ? 'var(--color-gold)' : 'var(--color-rule)', color: step === 2 ? '#fff' : 'var(--color-ink)' }}>2</span>
          <span className="font-medium">Choose payment method</span>
        </div>

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="fund-id" className="block text-sm font-medium mb-2">Fund</label>
              <select
                id="fund-id"
                name="fund_id"
                value={form.fund_id}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                style={{ borderColor: 'var(--color-rule)' }}
                required
              >
                <option value="">Select a fund</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>{fund.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                style={{ borderColor: 'var(--color-rule)' }}
                required
              />
            </div>
            <label className="flex items-center gap-3 text-sm md:col-span-2">
              <input
                name="recurring"
                type="checkbox"
                checked={form.recurring}
                onChange={handleChange}
                className="h-4 w-4 rounded border"
                style={{ borderColor: 'var(--color-rule)' }}
              />
              <span>Make this a recurring gift</span>
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button type="submit" className="px-6 py-3 rounded-full font-semibold text-white" style={{ background: 'var(--color-gold)' }}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="donor-name" className="block text-sm font-medium mb-2">Donor name</label>
                <input
                  id="donor-name"
                  name="donor_name"
                  type="text"
                  value={form.donor_name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                  style={{ borderColor: 'var(--color-rule)' }}
                />
              </div>
              <div>
                <label htmlFor="donation-email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  id="donation-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                  style={{ borderColor: 'var(--color-rule)' }}
                />
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="block text-sm font-medium mb-2">Payment method</legend>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'stripe', label: 'Stripe' },
                  { value: 'mpesa', label: 'M-Pesa' },
                ].map((option) => (
                  <label key={option.value} className="inline-flex items-center gap-2 rounded-full border px-4 py-3" style={{ borderColor: 'var(--color-rule)' }}>
                    <input
                      type="radio"
                      name="method"
                      value={option.value}
                      checked={form.method === option.value}
                      onChange={handleChange}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

              {form.method === 'mpesa' && (
                            <div>
                              <label htmlFor="donation-phone" className="block text-sm font-medium mb-2">Phone number</label>
                              <input
                                id="donation-phone"
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full rounded-2xl border px-4 py-3 bg-transparent"
                                style={{ borderColor: 'var(--color-rule)' }}
                              />
                              <MpesaManualInstructions fundName={selectedFund?.name} />
                            </div>
                          )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="px-6 py-3 rounded-full font-semibold border"
                style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button type="submit" className="px-6 py-3 rounded-full font-semibold text-white" style={{ background: 'var(--color-gold)' }}>
                {submissionStatus === 'saving' ? 'Processing...' : 'Donate now'}
              </button>
            </div>

            {successMessage && (
              <p className="text-sm font-medium" style={{ color: 'var(--color-sage)' }}>
                {successMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-sm font-medium" style={{ color: 'var(--color-gold)' }}>
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </form>
    </main>
  );
}
