import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 36,
};

export const Avatar = ({ src, name, size = 'md', className = '' }: AvatarProps) => {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full overflow-hidden flex-shrink-0
        flex items-center justify-center
        bg-gradient-to-br from-primary-100 to-primary-200
        text-primary-700 font-semibold
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User size={iconSizes[size]} className="text-primary-500" />
      )}
    </div>
  );
};
