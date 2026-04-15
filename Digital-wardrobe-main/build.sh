#!/bin/bash

set -e

BUILD_DIR="build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cp -r frontend/* "$BUILD_DIR/"

echo "Build complete: $BUILD_DIR"
