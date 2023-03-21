# hyper-gateway

A gateway for talking to hypercore-protocol using the same URL structures as [Agregore](https://agregore.mauve.moe/).

## Usage

```
npm i -g hyper-gateway
```

```
hyper-gateway run
```

Options: `hyper-gateway --help run`

```
hyper-gateway run

Run the gateway

Options:
  --version             Show version number                            [boolean]
  --help                Show help                                      [boolean]
  --writable            Control access to `PUT`       [boolean] [default: false]
  --port                The port to run the server on (HYPE)     [default: 4973]
  --persist             Whether data should be persisted to disk
                                                       [boolean] [default: true]
  --storage-location    The location to store hypercore data
                      [default: "/home/mauve/.local/share/hyper-gateway-nodejs"]
  --silent              Prevent additional logs       [boolean] [default: false]
  --subdomain           Enable serving `example-com.gateway.com/path` as `gatewa
                        y.com/hyper/example.com/path` [boolean] [default: false]
  --subdomain-redirect  Redirect `gateway.com/hyper/domain.here/path` to `domain
                        -here.gateway.com/path`       [boolean] [default: false]
```

## Routes

GET `http://localhost/4973/hyper/:key/*path`

You can load data from the gateway by specifying a Hyperdrive key and a path to a file or folder.

The specific HTTP verbs and headers that are supported can be found in [hypercore-fetch](https://github.com/RangerMauve/hypercore-fetch).
Basically you can replace the `hyper://` in a URL with `http://localhost:4973/hyper/` and it'll work.

## Subdomain / Subdomain-Redirect

When serving contents on a gateway, some sites may be using absolute URLs (e.g. `/scrtipt.js`) which can get messed up when the data is being served from `/hyper/key_here/`.

In order to account for this you can add the `--subdomain` flag which is based on the [IPFS Subdomain Gateway Spec](https://github.com/ipfs/specs/blob/main/http-gateways/SUBDOMAIN_GATEWAY.md), but applied to hyper.

If your domain is `https://example.com`, instead of using `https://example.com/hyper/blog.mauve.moe/index.html` to reference a URL, you can instead use `https://blog-mauve-moe.example.com/index.html`.

You may also place a hypercore public key into the subdomain to have similar effects.

You can also specify the `--subdomain-redirect` flag which will automatically perform a `301` HTTP redirect to the subdomain version of a URL when a user attempts to load the `/hyper/` path.

## Building native binaries

Hyper-gateway uses the [pkg](https://github.com/vercel/pkg) module to compile the node.js code into a single binary that you can distribute on a server.

- `git clone git@github.com:RangerMauve/hyper-gateway.git`
- Install node.js if you haven't already
- `npm install`
- `npm run build`
- Look in the `dist` folder for the platform you want.
