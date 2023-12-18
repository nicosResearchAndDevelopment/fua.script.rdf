#!/usr/bin/env node

const
    util  = require('./util.js'),
    async = require('@nrd/fua.core.async'),
    tty   = require('@nrd/fua.core.tty'),
    ts    = require('@nrd/fua.core.ts');

async.iife.process(async function TransformFiles() {

    await ts.pause();

    const
        rootFolder   = await tty.input('root folder'),
        inputPattern = await tty.input('input pattern'),
        outputFile   = await tty.input('output file');

    // TODO
    console.log({rootFolder, inputPattern, outputFile});

});
