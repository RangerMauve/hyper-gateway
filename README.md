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
  --version           Show version number                              [boolean]
  --help              Show help                                        [boolean]
  --writable          Control access to `PUT`         [boolean] [default: false]
  --port              The port to run the server on (HYPE)       [default: 4973]
  --p2p-port          The port to run the p2p network on (HYPR)  [default: 4977]
  --persist           Whether data should be persisted to disk
                                                       [boolean] [default: true]
  --storage-location  The location to store hypercore data
                      [default: "/home/mauve/.local/share/hyper-gateway-nodejs"]
  --silent            Prevent additional logs         [boolean] [default: false]
```

## Routes

GET `http://localhost/4973/hyper/:key/*path`

You can load data from the gateway by specifying a Hyperdrive key and a path to a file or folder.

The specific HTTP verbs and headers that are supported can be found in [hypercore-fetch](https://github.com/RangerMauve/hypercore-fetch).
Basically you can replace the `hyper://` in a URL with `http://localhost:4973/hyper/` and it'll work.

## Building native binaries

Hyper-gateway uses the [pkg](https://github.com/vercel/pkg) module to compile the node.js code into a single binary that you can distribute on a server.

- `git clone git@github.com:RangerMauve/hyper-gateway.git`
- Install node.js if you haven't already
- `npm install`
- `npm run build`
- Look in the `dist` folder for the platform you want.
