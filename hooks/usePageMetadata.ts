import { useEffect } from 'react';
import { AppView } from '../types';

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

export const usePageMetadata = (view: AppView, isAuthenticated: boolean) => {
  useEffect(() => {
    const isUserArea = view === 'dashboard';

    if (isUserArea && isAuthenticated) {
      document.title = 'AnyMais | Dashboard do Usuário';
      upsertMeta('meta[name="description"]', {
        name: 'description',
        content: 'Dashboard do usuário AnyMais com pets, agendamentos, saúde e serviços.',
      });
      upsertMeta('meta[name="robots"]', {
        name: 'robots',
        content: 'noindex, nofollow',
      });
      return;
    }

    const titles: Record<AppView, string> = {
      landing: 'AnyMais | Todo animal é bem-vindo',
      dashboard: 'AnyMais | Dashboard do Usuário',
      'public-adoption': 'AnyMais | Adoção Responsável',
      terms: 'AnyMais | Termos de Uso',
      privacy: 'AnyMais | Política de Privacidade',
      'ong-register': 'AnyMais | Cadastro de ONG',
      'public-ongs': 'AnyMais | ONGs Parceiras',
      'ong-profile': 'AnyMais | Perfil da ONG',
      'adoption-pet-profile': 'AnyMais | Perfil de Adoção',
      about: 'AnyMais | Sobre',
      careers: 'AnyMais | Carreiras',
      blog: 'AnyMais | Blog',
      contact: 'AnyMais | Contato',
      help: 'AnyMais | Ajuda',
    };

    const descriptions: Record<AppView, string> = {
      landing: 'Plataforma para adoção, saúde, namoro e serviços pet.',
      dashboard: 'Dashboard do usuário AnyMais com pets, agendamentos, saúde e serviços.',
      'public-adoption': 'Conheça pets disponíveis para adoção responsável.',
      terms: 'Termos de uso da plataforma AnyMais.',
      privacy: 'Política de privacidade da plataforma AnyMais.',
      'ong-register': 'Cadastre sua ONG na plataforma AnyMais.',
      'public-ongs': 'Conheca ONGs parceiras da AnyMais.',
      'ong-profile': 'Veja detalhes e formas de apoiar uma ONG parceira.',
      'adoption-pet-profile': 'Veja detalhes do pet para adocao.',
      about: 'Conheca a história e a missão da AnyMais.',
      careers: 'Oportunidades e cultura da AnyMais.',
      blog: 'Conteudos e dicas sobre cuidado animal.',
      contact: 'Canais de contato da AnyMais.',
      help: 'Ajuda e perguntas frequentes da AnyMais.',
    };

    document.title = titles[view];
    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: descriptions[view],
    });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: 'index, follow',
    });
  }, [view, isAuthenticated]);
};
