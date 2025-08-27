import React from 'react';

interface PlaceholderAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const PlaceholderAvatar: React.FC<PlaceholderAvatarProps> = ({ name, size = 'md', className = '' }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6 text-xs';
      case 'md':
        return 'h-8 w-8 text-sm';
      case 'lg':
        return 'h-12 w-12 text-lg';
      case 'xl':
        return 'h-16 w-16 text-xl';
      default:
        return 'h-8 w-8 text-sm';
    }
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    // Generate a consistent color based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`${getSizeClasses(size)} ${getRandomColor(name)} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

export default PlaceholderAvatar;







