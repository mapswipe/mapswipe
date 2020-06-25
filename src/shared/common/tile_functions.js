// @flow

function getQuadKeyFromCoordsAndZoom(x: number, y: number, zoom: number) {
    // Create a quadkey for use with certain tileservers that use them, e.g. Bing
    let quadKey = '';
    for (let i = zoom; i > 0; i -= 1) {
        let digit = 0;
        /* eslint-disable no-bitwise */
        const mask = 1 << (i - 1);
        if ((x & mask) !== 0) {
            digit += 1;
        }
        if ((y & mask) !== 0) {
            digit += 2;
        }
        /* eslint-enable no-bitwise */
        quadKey += digit.toString();
    }
    return quadKey;
}

function getBingURLFromQuadKey(quadKey, apiKey) {
    // Create a tile image URL linking to a Bing tile server.
    return `https://ecn.t0.tiles.virtualearth.net/tiles/a${quadKey}.jpeg?g=7505&mkt=en-US&token=${apiKey}`;
}

function formatXYZoomKey(
    urlTemplate: string,
    x: number,
    y: number,
    zoom: number,
    apiKey: string,
) {
    return urlTemplate
        .replace('{x}', x.toString())
        .replace('{y}', y.toString())
        .replace('{z}', zoom.toString())
        .replace('{key}', apiKey);
}

// eslint-disable-next-line import/prefer-default-export
export function getTileUrlFromCoordsAndTileserver(
    x: number,
    y: number,
    zoom: number,
    urlTemplate: string,
    tileServerName: string,
    apiKey: string,
    wmtsLayerName: ?string,
) {
    // build a tile's full URL from components and a python template URL
    let url = '';
    if (tileServerName === 'bing') {
        const quadKey = getQuadKeyFromCoordsAndZoom(x, y, zoom);
        url = getBingURLFromQuadKey(quadKey, apiKey);
    } else if (tileServerName === 'sinergise' && wmtsLayerName) {
        url = formatXYZoomKey(urlTemplate, x, y, zoom, apiKey).replace(
            '{layer}',
            wmtsLayerName,
        );
    } else if (tileServerName.includes('maxar')) {
        // maxar uses not the standard TMS tile y coordinate, but the Google tile y coordinate
        // more information here:
        // https://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/
        const newY = 2 ** zoom - y - 1;
        url = formatXYZoomKey(urlTemplate, x, newY, zoom, apiKey);
    } else if (tileServerName === 'custom' && urlTemplate.includes('{-y}')) {
        // this uses not the standard TMS tile y coordinate, but the Google tile y coordinate
        const newY = 2 ** zoom - y - 1;
        url = urlTemplate.replace('{-y}', '{y}');
        url = formatXYZoomKey(url, x, newY, zoom, apiKey);
    } else {
        url = formatXYZoomKey(urlTemplate, x, y, zoom, apiKey);
    }
    return url;
}
