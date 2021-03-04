#!/bin/sh

USER="nguy4477"
MACHINE="atlas.cselabs.umn.edu"
DIRECTORY=".www/Debug/"

# uncomment these lines if you add assets to the project
rm -rfv dist/assets # force delete everything in dist/assets
cp -rv public/assets dist/assets # copy folder and all contents recursively
rsync -avr --delete --chmod=D701,F644 dist/ "$USER"@"$MACHINE":"$DIRECTORY"
# remote sync recursively preserving all metadata
