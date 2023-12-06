import { offlineFallback, warmStrategyCache } from 'workbox-recipes';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute, Route } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Configurando Cache
const pageCache = new CacheFirst({
    cacheName: 'pwa-cam',
    plugins: [
        new CacheableResponsePlugin ({
            statuses: [0,200],
        }),
        new ExpirationPlugin({
            maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
    ],
});

// Indicando o Cache da pagina
warmStrategyCache({
    urls: ['/index.html','/',
'https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap'],
strategy: pageCache,
});

// Registrando rota
registerRoute(({request}) => request.node === 'navigate', pageCache);
registerRoute(//configurando assets
({ request }) => ['style', 'script', 'worker'].includes(request.destination),
new StaleWhileRevalidate({
    cacheName: 'asset-cache',
    plugins: [
        new CacheableResponsePlugin({
            statuses: [0,200],
        }),
    ],
}),
);

// Configurando offline fallbeack
offlineFallback({
    pageFallback: '/offiline.html',
});


const imageRoute = new Route(({ request }) => {
    return  request.destination === 'image';
}, new CacheFirst({
    cacheName: 'images',
    plugins: [
        new ExpirationPlugin({
            maxAgeSeconds: 60 *60 * 24 * 30,
        })
    ]
}));
registerRoute(imageRoute);