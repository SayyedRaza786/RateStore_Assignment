#!/bin/bash
npm run build
npx serve -s build -p $PORT
