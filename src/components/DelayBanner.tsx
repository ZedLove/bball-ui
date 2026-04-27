interface DelayBannerProps {
  description: string | null;
}

export function DelayBanner({ description }: DelayBannerProps) {
  return (
    <div
      role="alert"
      className="w-full animate-slide-down rounded-lg bg-amber-500 text-black px-4 py-2 text-sm font-semibold text-center"
    >
      {description ?? 'Game delayed'}
    </div>
  );
}
