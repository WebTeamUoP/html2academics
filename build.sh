#!/bin/bash

npm install
npm audit fix
git rm -r docs/*
npm run build && git add docs/*
