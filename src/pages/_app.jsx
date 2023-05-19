import '@/styles/globals.scss';
import PropTypes from 'prop-types';
import { SWRConfig } from 'swr';
import { ToastContainer } from 'react-toastify';
import NextNProgress from 'nextjs-progressbar';
import { DefaultSeo } from 'next-seo';
import { SSRProvider } from 'react-bootstrap';
import AppNavbar from '@/components/shared/AppNavbar';
import AppFooter from '@/components/shared/AppFooter';
import ENV from '@/lib/constants/environmentVariables';

function App({ Component, pageProps }) {
  return (
    <SSRProvider>
      <SWRConfig
        value={{
          fetcher: (resource, init) =>
            fetch(resource, init).then((response) => response.json()),
        }}
      >
        <NextNProgress />
        <AppNavbar />
        <DefaultSeo
          title={undefined}
          titleTemplate="RiiTag | %s"
          defaultTitle="RiiTag"
          description="RiiTag is a customizable gamertag for the Wii."
          additionalLinkTags={[
            {
              rel: 'apple-touch-icon',
              href: `${ENV.BASE_URL}/img/apple-touch-icon.ico`,
            },
            {
              rel: 'icon',
              type: 'image/png',
              sizes: '32x32',
              href: `${ENV.BASE_URL}/img/favicon-32x32.png`,
            },
            {
              rel: 'icon',
              type: 'image/png',
              sizes: '16x16',
              href: `${ENV.BASE_URL}/img/favicon-16x16.png`,
            },
            {
              rel: 'manifest',
              href: `${ENV.BASE_URL}/img/manifest.json`,
            },
            {
              rel: 'mask-icon',
              href: `${ENV.BASE_URL}/img/safari-pinned-tag.svg`,
              color: '#5bbad5',
            },
          ]}
          openGraph={{
            type: 'website',
            locale: 'en',
            url: ENV.BASE_URL,
            site_name: 'RiiTag',
            images: [
              {
                url: `${ENV.BASE_URL}/logo.png`,
                width: 630,
                height: 275,
                alt: 'RiiTag Logo',
                type: 'image/png',
              },
            ],
          }}
          twitter={{
            handle: '@RiiConnect24',
            site: '@RiiConnect24',
            cardType: 'summary_large_image',
          }}
        />
        <Component {...pageProps} />
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="colored"
        />
        <AppFooter />
      </SWRConfig>
    </SSRProvider>
  );
}

App.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default App;
