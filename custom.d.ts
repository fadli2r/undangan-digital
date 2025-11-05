// Di dalam file custom.d.ts

// Ini akan memberitahu TypeScript tentang properti yang ada di <ion-icon>
type IonIconProps = {
  name?: string;
  src?: string;
  icon?: string;
  size?: 'small' | 'large';
  color?: string;
};

declare namespace JSX {
  interface IntrinsicElements {
    // Daftarkan 'ion-icon' sebagai elemen yang valid
    'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & IonIconProps;
  }
}