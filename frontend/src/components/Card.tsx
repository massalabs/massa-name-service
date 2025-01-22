interface CardProps {
  children: React.ReactNode;
  bgColor?: string;
  customClass?: string;
}

export function Card({
  bgColor = 'bg-primary',
  customClass = '',
  children,
}: CardProps) {
  return (
    <div className={`${bgColor} ${customClass} border-none rounded-xl p-5`}>
      {children}
    </div>
  );
}
