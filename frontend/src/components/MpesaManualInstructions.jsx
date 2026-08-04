import { useChurchSettings } from '../context/ChurchSettingsContext';

/**
 * Manual "pay it yourself" fallback for people who don't want to wait on
 * the STK push prompt. Renders nothing until mpesa_business_number is set
 * in Church Settings — safe to include even before you're registered.
 *
 * Usage: <MpesaManualInstructions fundName={selectedFund?.name} />
 * fundName is optional — falls back to "General Fund" if not passed.
 */
export default function MpesaManualInstructions({ fundName }) {
  const { settings } = useChurchSettings();
  const number = settings?.mpesa_business_number;
  const isPaybill = settings?.mpesa_business_type === 'paybill';

  if (!number) return null;

  return (
    <div
      className="mt-6 p-4 rounded-lg border"
      style={{ borderColor: 'var(--color-rule)' }}
    >
      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-sage)' }}>
        Prefer to pay it yourself instead of waiting for the prompt?
      </p>
      <ol className="text-sm space-y-1.5 list-decimal list-inside" style={{ opacity: 0.85 }}>
        <li>
          Go to M-Pesa menu → Lipa na M-Pesa →{' '}
          {isPaybill ? 'Pay Bill' : 'Buy Goods and Services'}
        </li>
        {isPaybill ? (
          <>
            <li>
              Business number: <strong style={{ color: 'var(--color-ink)' }}>{number}</strong>
            </li>
            <li>
              Account number:{' '}
              <strong style={{ color: 'var(--color-ink)' }}>{fundName || 'General Fund'}</strong>
            </li>
          </>
        ) : (
          <li>
            Till number: <strong style={{ color: 'var(--color-ink)' }}>{number}</strong>
          </li>
        )}
        <li>Enter the amount, then your M-Pesa PIN to complete.</li>
      </ol>
    </div>
  );
}