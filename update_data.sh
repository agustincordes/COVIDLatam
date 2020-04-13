#!/bin/bash

git submodule update --remote
node js/scrape_data.js
git add .
git commit -m "Actualización de datos"
git push --recurse-submodules=check
