# Darkwire Client with [Forge 0.9.1](https://github.com/digitalbazaar/forge) (no window.crypto.subtle dependency)

This is the client for [Darkwire](https://github.com/darkwire/darkwire.io). It requires [darkwire-server](../server) in order to run.

## What is Forge for ?

To serve client static files on simple `http` server, with NO need for `https` .

## Why using `forge` instead of `window.crypto.subtle` ?

`window.crypto.subtle` is available only in secure context. What does that mean?
It means you **forced** to run your website on https protocol with SSL certificate for your
domain name in order to get use of `window.crypto.subtle` , otherwise it will be **undefined** and your
client app will not work at all!

## Motivation to use forge instead of `window.crypto.subtle`
It helps you to improve anonymity if you run a darkwire.io server. 
The person who runs a server having a client that uses *Forge* **doesn't need to buy a domain and doesn't need to register an SSL for a domain!**.
We all know that in order to get ssl certificate you need to register your email and domain name to your name
before you get ssl certificate even from letsencrypt.com .
So if you want to deploy darkwire.io on your custom server with public ip but without an ssl certificate
it will not work at all. And it will say you tat `window.crypto.subtle is undefined` in developer console.

## Solution if you don't want to use https ?
Use forge library to generate secret keys instead of window.crypto.subtle!

## Is it still secure ?

Yes, it is as secure as darkwire.io using `window.crypto.subtle` . The security mechanism is the same but 
translated to use Forge and it doesn't require you to run your server on `https`, just run it on simple `http` server
to serve static compiled client code files.


## Translations

Translation strings are pulled from JSON files in [this directory](https://github.com/darkwire/darkwire.io/tree/master/client/src/i18n). We welcome pull requests to add support for more lanuages. For native speakers, it should take only a few minutes to translate the site.

Please see [this PR](https://github.com/darkwire/darkwire.io/pull/95) for an example of what your translation PR should look like.

Thank you for your contributions!
