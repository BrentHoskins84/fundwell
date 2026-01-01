import { DollarSign } from 'lucide-react';
import type { FC, SVGProps } from 'react';

import type { Database } from '@/libs/supabase/types';

type PaymentOptionType = Database['public']['Enums']['payment_option_type'];

interface PaymentConfigItem {
  color: string;
  Icon: FC<SVGProps<SVGSVGElement>>;
}

const VenmoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.5 3c.9 1.5 1.3 3 1.3 5 0 6.2-5.3 14.2-9.6 19H3.5L1 4.5l7.2-.7 1.3 10.5c1.2-2 2.7-5.1 2.7-7.2 0-1.9-.3-3.2-.9-4.3L19.5 3z" />
  </svg>
);

const PayPalIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.038-.2.73-4.621.047-.256a.925.925 0 0 1 .914-.787h.576c3.727 0 6.644-1.514 7.497-5.896.356-1.834.172-3.365-.705-4.535z" />
  </svg>
);

const CashAppIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.59 3.47A5.1 5.1 0 0 0 20.53.41C19.36 0 18.03 0 15.36 0H8.64C5.97 0 4.64 0 3.47.41A5.1 5.1 0 0 0 .41 3.47C0 4.64 0 5.97 0 8.64v6.72c0 2.67 0 4 .41 5.17a5.1 5.1 0 0 0 3.06 3.06c1.17.41 2.5.41 5.17.41h6.72c2.67 0 4 0 5.17-.41a5.1 5.1 0 0 0 3.06-3.06c.41-1.17.41-2.5.41-5.17V8.64c0-2.67 0-4-.41-5.17zM17.19 8.3l-.76.76a.91.91 0 0 1-1.21.06 3.62 3.62 0 0 0-2.38-.88c-.91 0-1.52.27-1.52.86 0 .65.61.86 1.85 1.13 1.98.43 3.64 1.1 3.64 3.18 0 2.28-1.82 3.4-4.07 3.64v1.39a.91.91 0 0 1-.91.91h-1.21a.91.91 0 0 1-.91-.91v-1.42a6.48 6.48 0 0 1-3.18-1.13.91.91 0 0 1-.12-1.36l.76-.76a.91.91 0 0 1 1.21-.06 4.17 4.17 0 0 0 2.7 1c.91 0 1.64-.3 1.64-.98 0-.68-.46-.91-1.82-1.18-2.01-.4-3.64-1.06-3.64-3.09 0-2.03 1.64-3.34 3.91-3.58V4.56a.91.91 0 0 1 .91-.91h1.21a.91.91 0 0 1 .91.91v1.36a5.76 5.76 0 0 1 2.7.88.91.91 0 0 1 .09 1.5z" />
  </svg>
);

const ZelleIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.559 24h-2.841a.483.483 0 0 1-.483-.483v-4.765H3.354c-.388 0-.653-.333-.483-.681l1.083-2.212a.483.483 0 0 1 .433-.269h5.847V12.6L3.028 19.034a.483.483 0 0 1-.663-.144l-1.614-2.473a.483.483 0 0 1 .09-.633l8.393-6.676V4.996H2.847a.483.483 0 0 1-.432-.268L1.332.516A.483.483 0 0 1 1.764 0h12.087c.267 0 .483.216.483.483v8.126l7.206-5.732a.483.483 0 0 1 .663.144l1.614 2.473a.483.483 0 0 1-.09.633l-8.652 6.882v6.509h5.847c.387 0 .653.333.483.68l-1.083 2.213a.483.483 0 0 1-.433.268h-4.814v4.838a.483.483 0 0 1-.483.483h-.043z" />
  </svg>
);

const DollarSignIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <DollarSign {...props} />
);

export const PAYMENT_CONFIG: Record<PaymentOptionType, PaymentConfigItem> = {
  venmo: {
    color: 'text-blue-400',
    Icon: VenmoIcon,
  },
  paypal: {
    color: 'text-blue-500',
    Icon: PayPalIcon,
  },
  cashapp: {
    color: 'text-green-400',
    Icon: CashAppIcon,
  },
  zelle: {
    color: 'text-purple-400',
    Icon: ZelleIcon,
  },
};

export function getPaymentConfig(type: PaymentOptionType): PaymentConfigItem {
  return (
    PAYMENT_CONFIG[type] ?? {
      color: 'text-zinc-400',
      Icon: DollarSignIcon,
    }
  );
}

