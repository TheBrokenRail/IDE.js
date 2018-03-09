#!/bin/bash
git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"

mkdir gh-pages
cp dist/* gh-pages
cd gh-pages
git init
git add .
git commit --quiet -m "Deploy to Github Pages"
git push --force "https://${GITHUB_TOKEN}@github.com/TheBrokenRail/IDE.js.git" master:gh-pages
