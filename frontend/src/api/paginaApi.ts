// src/api/paginaApi.ts
import { http } from '@/lib/apiClient';

interface Image {
  id: number;
  url: string;
}

interface Subtitulo {
    id: number;
    titulo_subtitulo: string;
    resumen: string;
    image: Image;
}

export interface Pagina {
    id: number;
    titulo_paginas: string;
    subtitulos: Subtitulo[];
}

const PUBLIC_BASE_ENDPOINT = '/public/paginas';

export const getPublicPaginas = (): Promise<Pagina[]> => {
    return http.get<Pagina[]>(PUBLIC_BASE_ENDPOINT);
};
