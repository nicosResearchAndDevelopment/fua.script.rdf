#!/usr/bin/env node

const
    util  = require('./util.js'),
    path  = require('path'),
    async = require('@nrd/fua.core.async'),
    tty   = require('@nrd/fua.core.tty'),
    ts    = require('@nrd/fua.core.ts');

async.iife.process(async function TransformFiles() {

    await ts.pause();

    const
        rootFolder   = await tty.input('root folder') || path.join(__dirname, '..'),
        inputPattern = await tty.input('input pattern') || 'data/input/**/*.{ttl,jsonld}',
        inputFiles   = await util.collectFiles(rootFolder, inputPattern),
        inputData    = await Promise.all(inputFiles.map(util.readDataset)),
        INPUT        = tty.color.green(tty.style.bold('INPUT'));

    inputFiles.forEach(file => tty.output(`${INPUT} ${file} ()`));

    const
        outputData    = util.mergeDatasets(inputData),
        outputFile    = await tty.input('output file') || path.join(__dirname, '../data/output.ttl'),
        absOutputFile = path.isAbsolute(outputFile) ? outputFile : path.join(rootFolder, outputFile),
        OUTPUT        = tty.color.red(tty.style.bold('OUTPUT'));

    tty.output(`${OUTPUT} ${absOutputFile}`);

    async function confirm() {
        const value = await tty.input('confirm (y/n)');
        if (value.toLowerCase().startsWith('y')) return true;
        if (value.toLowerCase().startsWith('n')) return false;
        return confirm();
    }

    if (await confirm()) {
        await util.writeDataset(absOutputFile, outputData);
        tty.log.done();
    } else {
        tty.log.warning('canceled');
    }

});
