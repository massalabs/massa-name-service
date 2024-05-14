interface CardProps {
  children: React.ReactNode;
  bgColor?: string;
  customClass?: string;
}

export function Card({
  children,
  bgColor = 'bg-primary',
  customClass = '',
}: CardProps) {
  return (
    <div className={`${bgColor} ${customClass} border-none rounded-xl p-5`}>
      {children}
    </div>
  );
}
