#!/bin/sh

npm install --allow-root

mkdir -p dist

# npm run webpack

npx webpack serve
