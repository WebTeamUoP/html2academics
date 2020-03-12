#!/bin/bash

git rm -r docs/*
npm run build && git add docs/*