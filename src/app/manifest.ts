
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bio Hub Pro',
    short_name: 'BioHub',
    description: 'Персональный ИИ био-хаб для управления здоровьем',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#00ffff',
    icons: [
      {
        src: 'https://placehold.co/192x192/010411/00ffff?text=BioHub&font=montserrat',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/512x512/010411/00ffff?text=BioHub&font=montserrat',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
