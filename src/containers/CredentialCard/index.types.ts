export interface CredentialCardProps {
  title: string;
  subtitle: string;
  date: string;
  verified: boolean;
  avatar?: string;
  onCardClick?: () => void;
  className?: string;
}
