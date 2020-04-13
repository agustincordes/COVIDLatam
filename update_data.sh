#!/bin/bash

git submodule update --remote
node js/scrape_data.js
