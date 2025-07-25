'use client';

import React from 'react';

// SF Symbols-style icon component props
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
  variant?: 'outline' | 'fill' | 'circle' | 'circle-fill' | 'square' | 'square-fill';
}

// Base icon wrapper with SF Symbols styling
const IconWrapper: React.FC<{ children: React.ReactNode } & IconProps> = ({ 
  children, 
  className = '', 
  style = {},
  weight = 'regular'
}) => {
  const getStrokeWidth = () => {
    switch (weight) {
      case 'ultralight': return 0.5;
      case 'thin': return 1;
      case 'light': return 1.25;
      case 'regular': return 1.5;
      case 'medium': return 1.75;
      case 'semibold': return 2;
      case 'bold': return 2.25;
      case 'heavy': return 2.5;
      case 'black': return 3;
      default: return 1.5;
    }
  };

  return (
    <svg
      className={`sf-symbol ${className}`}
      style={{
        strokeWidth: getStrokeWidth(),
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...style
      }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {children}
    </svg>
  );
};

// Home Icons
export const HomeIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M11.293 3.293a1 1 0 011.414 0l6 6 2 2a1 1 0 01-1.414 1.414L19 12.414V19a2 2 0 01-2 2h-3a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H4a2 2 0 01-2-2v-6.586l-.293.293a1 1 0 01-1.414-1.414l2-2 6-6z" 
        fill="currentColor"
      />
    ) : (
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    )}
  </IconWrapper>
);

// Calendar Icons
export const CalendarIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 9h16v9H4V9z" 
        fill="currentColor"
      />
    ) : (
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    )}
  </IconWrapper>
);

// Photo Icons
export const PhotoIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M4 3a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 6a3 3 0 11-6 0 3 3 0 016 0z" 
        fill="currentColor"
      />
    ) : (
      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    )}
  </IconWrapper>
);

// Settings Icon
export const SettingsIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.279 5.57a1.875 1.875 0 00-2.28.485l-.92.92a1.875 1.875 0 00-.485 2.28l.32 1.038c.043.116.032.284-.083.45a7.493 7.493 0 00-.57.986c-.088.182-.228.277-.348.297l-1.072.178A1.875 1.875 0 00.25 11.078v1.304c0 .917.663 1.699 1.567 1.85l1.072.178c.12.02.26.115.348.297.165.34.359.664.57.986.115.166.126.334.083.45l-.32 1.038a1.875 1.875 0 00.485 2.28l.92.92a1.875 1.875 0 002.28.485l1.038-.32c.116-.043.284-.032.45.083.322.211.646.405.986.57.182.088.277.228.297.348l.178 1.072a1.875 1.875 0 001.85 1.567h1.304c.917 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.115-.26.297-.348.34-.165.664-.359.986-.57.166-.115.334-.126.45-.083l1.038.32a1.875 1.875 0 002.28-.485l.92-.92a1.875 1.875 0 00.485-2.28l-.32-1.038c-.043-.116-.032-.284.083-.45.211-.322.405-.646.57-.986.088-.182.228-.277.348-.297L21.204 13.1a1.875 1.875 0 001.567-1.85v-1.304c0-.917-.663-1.699-1.567-1.85L20.132 7.92c-.12-.02-.26-.115-.348-.297a7.493 7.493 0 00-.57-.986c-.115-.166-.126-.334-.083-.45l.32-1.038a1.875 1.875 0 00-.485-2.28l-.92-.92a1.875 1.875 0 00-2.28-.485L14.728 2.685c-.116.043-.284.032-.45-.083a7.493 7.493 0 00-.986-.57c-.182-.088-.277-.228-.297-.348L12.817 .612A1.875 1.875 0 0011.078.25h-1.304zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" 
        fill="currentColor"
      />
    ) : (
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    )}
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </IconWrapper>
);

// Plus Icon
export const PlusIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'circle-fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5 11h-4v4a1 1 0 11-2 0v-4H7a1 1 0 110-2h4V7a1 1 0 112 0v4h4a1 1 0 110 2z" 
        fill="currentColor"
      />
    ) : variant === 'circle' ? (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8m-4-4h8" />
      </>
    ) : (
      <path d="M12 4v16m8-8H4" />
    )}
  </IconWrapper>
);

// Search Icon
export const SearchIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" 
        fill="currentColor"
      />
    ) : (
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    )}
  </IconWrapper>
);

// Arrow Icons
export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M15 18l-6-6 6-6" />
  </IconWrapper>
);

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M9 18l6-6-6-6" />
  </IconWrapper>
);

export const ArrowUpIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M18 15l-6-6-6 6" />
  </IconWrapper>
);

export const ArrowDownIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M6 9l6 6 6-6" />
  </IconWrapper>
);

// System Icons
export const HeartIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" 
        fill="currentColor"
      />
    ) : (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    )}
  </IconWrapper>
);

export const ShareIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </IconWrapper>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </IconWrapper>
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </IconWrapper>
);

export const FilterIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </IconWrapper>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M18 6L6 18M6 6l12 12" />
  </IconWrapper>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </IconWrapper>
);

export const CheckIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'circle-fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 8.293l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L11 13.172l4.293-4.293a1 1 0 111.414 1.414z" 
        fill="currentColor"
      />
    ) : variant === 'circle' ? (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </>
    ) : (
      <path d="M20 6L9 17l-5-5" />
    )}
  </IconWrapper>
);

// Upload Icon
export const UploadIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </IconWrapper>
);

// Grid Icons
export const GridIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </IconWrapper>
);

export const ListIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </IconWrapper>
);

// More Icons
export const MoreIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </IconWrapper>
);

export const MoreHorizontalIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </IconWrapper>
);

// Clock Icon
export const ClockIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </IconWrapper>
);

// Location Icon
export const LocationIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </IconWrapper>
);

// Tag Icon
export const TagIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </IconWrapper>
);

// Alert Icons
export const AlertIcon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconWrapper>
);

// Star Icon
export const StarIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
        fill="currentColor"
      />
    ) : (
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    )}
  </IconWrapper>
);

// Folder Icon
export const FolderIcon: React.FC<IconProps> = ({ variant = 'outline', ...props }) => (
  <IconWrapper {...props}>
    {variant === 'fill' ? (
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M3 6a3 3 0 013-3h4.586a1 1 0 01.707.293L12.414 5H18a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" 
        fill="currentColor"
      />
    ) : (
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    )}
  </IconWrapper>
);

const AppleIcons = {
  HomeIcon,
  CalendarIcon,
  PhotoIcon,
  SettingsIcon,
  PlusIcon,
  SearchIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HeartIcon,
  ShareIcon,
  TrashIcon,
  EditIcon,
  FilterIcon,
  CloseIcon,
  MenuIcon,
  CheckIcon,
  UploadIcon,
  GridIcon,
  ListIcon,
  MoreIcon,
  MoreHorizontalIcon,
  ClockIcon,
  LocationIcon,
  TagIcon,
  AlertIcon,
  StarIcon,
  FolderIcon
};

export default AppleIcons;